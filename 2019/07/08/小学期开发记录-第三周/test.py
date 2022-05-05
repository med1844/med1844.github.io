s = """
[INFO] Generating Chunk [0, 0]
[INFO] Generating Chunk [0, 1]
[INFO] Generating Chunk [1, 0]
[INFO] Generating Chunk [1, 1]
[INFO] Generating Chunk Mesh [0, 0]
600
0
0
99
0
0
213
0
0
875
0
0
[INFO] Generating Chunk Mesh [0, 1]
804
0
0
660
0
0
723
0
0
868
0
0
[INFO] Generating Chunk Mesh [1, 0]
404
0
0
0
0
0
692
0
0
597
0
0
[INFO] Generating Chunk Mesh [1, 1]
627
0
0
635
0
0
807
0
0
522
0
0
"""

res = 0
for _ in s.split():
    try:
        n = int(_)
        res += n
    except:
        continue

print(res)