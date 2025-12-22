import json
import os
import time
import re
from pathlib import Path
from openai import OpenAI

THIS_DIR = Path(__file__).resolve().parent
BOOK_FILE_JSON = THIS_DIR / "西游记-原文.json"

OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "http://127.0.0.1:1025/v1")
MODEL = os.getenv("OPENAI_MODEL", "qwen3-32b")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "xxx")  # 没有设置 key

client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)

# None 表示处理全部章节；设置为正整数可用于抽样调试
PROCESSING_CHAPTER_COUNT = None
MAX_CHUNK_CHARS = 800

OUTPUT_FILE = THIS_DIR / "西游记-白话文.json"
COT_TAG_PATTERN = re.compile(r"<think>.*?</think>", re.DOTALL)


def load_book(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _post_chat(messages, temperature=0.6, max_tokens=32000):
    # 使用 openai SDK 调用聊天接口
    resp = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    return resp.choices[0].message.content


def clean_model_output(text):
    if not text:
        raise ValueError("无法从响应中提取纯文本译文")
    return COT_TAG_PATTERN.sub("", text).strip()


def translate_plain_text(chunk_text, retries=3, backoff=3):
    """将单段古文翻译为白话文本，返回纯文本译文（不含多余说明）。"""
    system_prompt = (
        "你是精通《西游记》文本和古白话的专业翻译助手，擅长将古典小说语言转化为流畅的现代白话文。\n"
        "任务：把《西游记》的古文段落翻译为自然、通顺、符合现代阅读习惯的白话文，完整还原原文语义。\n"
        "核心要求：\n"
        "1. 语义完整性：不仅替换古词，还要还原句子的语气、场景感和人物神态，不遗漏任何情节细节；\n"
        "2. 专有名词：保留人名（如孙悟空、唐僧）、地名（如花果山、西天）、法宝名（如金箍棒）的原名，无需解释；\n"
        "3. 古词解释：仅对生僻且影响理解的古词（如“掣出”“径奔”）在首次出现时用括号简要解释（如“掣出（抽出）”）；\n"
        "4. 语言风格：符合《西游记》的小说语境，译文生动但不添加原文没有的信息，不删减原文内容；\n"
        "5. 输出规范：只返回纯译文文本，无任何注释、引用、格式标记或额外说明。\n"
        "示例：\n"
        "原文：那猴在山中，却会行走跳跃，食草木，饮涧泉，采山花，觅树果；与狼虫为伴，虎豹为群，獐鹿为友，猕猿为亲；夜宿石崖之下，朝游峰洞之中。\n"
        "译文：那石猴在山里，整天跑来跳去，吃的是草木，喝的是山涧里的泉水，采摘山花，寻找野果；和狼虫做伴，跟虎豹成群，与獐鹿为友，同猕猿亲近；晚上就睡在石崖下面，早上便在山峰洞穴中游玩。"
    )

    user_prompt = f"原文：\n{chunk_text}\n\n请直接返回译文："

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt + "\n/no_think"},
    ]

    for attempt in range(1, retries + 1):
        try:
            text = _post_chat(messages, temperature=0.1, max_tokens=32000)
            return clean_model_output(text)

        except Exception:
            if attempt == retries:
                raise
            time.sleep(backoff * attempt)


def split_text_into_chunks(text, max_chars=MAX_CHUNK_CHARS):
    """将长文本按标点优先断句切分为不超过 max_chars 的块。"""
    if len(text) <= max_chars:
        return [text]

    separators = "\n"
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        if end == len(text):
            chunks.append(text[start:end])
            break

        # 在可接受范围内寻找最后一个分割符
        seg = text[start:end]
        pos = -1
        for i in range(len(seg) - 1, -1, -1):
            if seg[i] in separators:
                pos = i + 1
                break

        if pos <= 0:
            # 找不到分隔符，则硬切
            pos = end - start

        chunks.append(text[start : start + pos])
        start = start + pos

    return chunks


def normalize_book(book):
    # 尝试把多种可能的 JSON 结构标准化为章节列表，每章为 dict: {'title', 'original'}
    chapters = []
    if isinstance(book, list):
        for i, item in enumerate(book, start=1):
            if isinstance(item, dict):
                title = (
                    item.get("title") or item.get("chapter") or f"第{len(chapters)+1}回"
                )
                # 可能的正文字段
                text = (
                    item.get("content")
                    or item.get("text")
                    or item.get("original")
                    or json.dumps(item, ensure_ascii=False)
                )
            else:
                title = f"第{i}回"
                text = str(item)
            chapters.append({"title": title, "original": text})
    else:
        raise ValueError("无法识别的书籍 JSON 结构")
    return chapters


def run():
    print("加载原文...")
    chapters = normalize_book(load_book(BOOK_FILE_JSON))
    print(f"共检测到 {len(chapters)} 章。")

    if PROCESSING_CHAPTER_COUNT and PROCESSING_CHAPTER_COUNT > 0:
        chapters = chapters[:PROCESSING_CHAPTER_COUNT]
        print(f"已截取前 {len(chapters)} 章作为处理集。")

    translations = []

    for idx, chapter in enumerate(chapters, start=1):
        title = chapter["title"]
        original_text = chapter["original"]
        print(f"处理第 {idx} 章：{title}（字符数 {len(original_text)}）")

        parts = split_text_into_chunks(original_text)  #

        translated_parts = []
        for part_idx, part in enumerate(parts, start=1):
            print(f"  翻译第 {part_idx}/{len(parts)} 段...(字符数 {len(part)})")
            translated_parts.append(translate_plain_text(part))

        translations.append(
            {
                "title": title,
                "original": original_text,
                "translation": "".join(translated_parts),
            }
        )

    # 最后把结果写入文件
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)

    print("完成，输出写入：", OUTPUT_FILE)


if __name__ == "__main__":
    print("begin")
    run()
