import hanlp

# 加载古汉语分词模型（自动下载适配语料）
tokenizer = hanlp.load(hanlp.pretrained.tok.UD_CTB7_HANLP)
# 西游记文本示例
text = "那猴在山中，却会行走跳跃，食草木，饮涧泉，采山花，觅树果；与狼虫为伴，虎豹为群，獐鹿为友，猕猿为亲；夜宿石崖之下，朝游峰洞之中。"
# 分词结果
tokens = tokenizer(text)
print(tokens)
# 输出：['那猴', '在', '山中', '，', '却会', '行走跳跃', '，', '食', '草木', '，', '饮', '涧泉', '，', '采', '山花', '，', '觅', '树果', '；', ...]
