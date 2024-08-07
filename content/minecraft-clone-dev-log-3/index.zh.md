---

title: 小学期开发记录 - 第三周
date: 2019-07-08
tags: java
category: 整活
hidden: true
---

## 2019/07/08

做完光影之后整整一天都非常咸鱼。毕竟在画质方面，这么多年来心心念念的坑终于填了。同时也没有什么明确的方向。

忍不住再贴一张:

![simplexNoiseFixed](simplexNoiseFixed.png)

然后在课上稍微玩了一会simplex噪声，用3d的噪声做了个GIF玩:

![simplexAnimation](simplexAnimation.gif)

有点好奇体积云之类的是不是也是用这种噪声生成的呢?

---

后来得知课程设计里面需要用到数据库。这就很尴尬了，因为原版MC我实在是想不到哪里要用到数据库。

我之前待过的服务器里面，插件中的mcMMO确实是使用了数据库来存储每个玩家的数据。但是显然我们离mcMMO还远的很呢。

最后打算弄个皮肤之类的。用数据库存一下用户名和密码，然后根据数据库返回的皮肤信息来生成人物mesh。

现在先做地形生成。目前探讨下来大致是这个顺序:

- 确定Biome
- 根据Biome生成Height Map
- Interpolation来确保Height Map在Biome交界处是平滑的。
- Decoration，根据Biome来生成地表装饰。
- Carving，~~挖洞~~生成洞穴。
- Ores，生成大家都喜欢的矿脉。
- Decoration，生成地表的装饰物，像是树，草，花之类的。

在做这个之前我想我应该先把水和玻璃，以及一些其他的方块加进游戏里。

看起来接下来几天可能不会有什么非常好看的成果了。毕竟在做出让人感觉可以被接受的Height Map之前，有很多工作要做。

## 2019/07/09

首先简单加了一下雾效果。目前它还只存在于fragment shader里。

然后加了一下包括流体和透明方块在内的方块。不知道为什么渲染起来这么慢...帧率总之已经爆炸了。 

![moreBlocks](moreBlocks.png)

显而易见的是，透明方块背后的面也没有被渲染。我想这应该是OpenGL的问题:

![transparencyError](transparencyError.png)

有些方向的面是被渲染的，而另外一些方向的面就没有被渲染。如果你穿过玻璃或者水，就会发现其实那些面被加进了mesh里，并且也会被渲染，只不过被玻璃覆盖了而已。

并且也可以从图中发现玻璃的阴影并不正确。这是因为采用的渲染方式不是deferred shading，而是先渲染depth map，然后再渲染整个mesh。这样会导致透明方块的depth map渲染错误，因为它是被当作一整个方块来进行深度采样的。

看来下一步暂时不是地形生成，而是先改成deferred shading，然后看看有没有什么办法能够解决OpenGL的这个问题。毕竟这还是太致命了。

同时还发现了Texture Array，不知道它的效率跟使用一整张terrain.png相比哪个更快。如果是Texture Array的话，只能说明又要推倒重来了...

总之，下一步是更改渲染结构。应该能够在今天完成。应该。尽量不给自己插flag...

---

这玩意改起来意外的耗时间。今天凌晨估计是写不完了。

有一点想要记录一下，就是教程中是把shadow放在第一次geometry pass中实现的，但是实际上为了正确实现玻璃的阴影，所以我想可能会把shadow搬到后面实现。 

但是还有另外一个问题就是，目前shadow map是在`glViewPort`之前就完成采样了。如果要实现玻璃的阴影的话就要把shadow map也放到后面去。

有点麻烦啊。

---

显示器到啦！大屏幕敲代码真的好快乐555

最后是通过非常傻逼的操作完成了玻璃的正确渲染:

```java
        for (Chunk[] chunkList : scene.chunkManager.getChunks()) {
            for (Chunk chunk : chunkList) {
                sceneShader.setUniform("modelViewMatrix",
                        transformations.buildModelViewMatrix(chunk, viewMatrix)
                );
                sceneShader.setUniform("modelLightViewMatrix",
                        transformations.buildModelLightViewMatrix(chunk, lightViewMatrix)
                );
                chunk.renderSolid();
            }
        }
        for (Chunk[] chunkList : scene.chunkManager.getChunks()) {
            for (Chunk chunk : chunkList) {
                sceneShader.setUniform("modelMatrix", transformations.getModelMatrix(chunk));
                sceneShader.setUniform("modelViewMatrix",
                        transformations.buildModelViewMatrix(chunk, viewMatrix)
                );
                sceneShader.setUniform("modelLightViewMatrix",
                        transformations.buildModelLightViewMatrix(chunk, lightViewMatrix)
                );
                chunk.renderMovable();
            }
        }
        for (Chunk[] chunkList : scene.chunkManager.getChunks()) {
            for (Chunk chunk : chunkList) {
                sceneShader.setUniform("modelMatrix", transformations.getModelMatrix(chunk));
                sceneShader.setUniform("modelViewMatrix",
                        transformations.buildModelViewMatrix(chunk, viewMatrix)
                );
                sceneShader.setUniform("modelLightViewMatrix",
                        transformations.buildModelLightViewMatrix(chunk, lightViewMatrix)
                );
                chunk.renderTransparencies();
            }
        }
```

简单来说就是无脑渲染三次就好了。非常令人窒息的操作。

令人感到意外的是这样做竟然没有怎么对性能产生影响。好像FPS反而上升了一点。

之前FPS爆炸其实是因为要渲染的面实在太多了。我简单加了一个`System.out.println`记了一下，如果是把水和玻璃放进来的话，渲染面数会超过10万。同样的Chunk数量，如果去掉水和玻璃而只保留Solid方块的话渲染面数就只剩下9000左右了。高下立判。

MC能够做到的性能是怎样呢? 对于这一点还是非常好奇的。

---

之后看了一下[lwjgl book](https://ahbejarano.gitbook.io/lwjglgamedev/chapter23)的教程，差不多搞懂了Object Picking的原理之后就自己瞎写了一个:

```java
    private Vector3f selectBlock(Chunk[][] chunks, Vector3f center, Vector3f dir) {
        Chunk selectedChunk = null;
        float blockClosestDistance = Float.POSITIVE_INFINITY;
        float chunkClosestDistance = Float.POSITIVE_INFINITY;

        for (Chunk[] chunkList : chunks) {
            for (Chunk chunk : chunkList) {
                min.set(chunk.getPosition());
                max.set(chunk.getPosition());
                max.add(Chunk.getX(), Chunk.getY(), Chunk.getZ()); // the size of chunk
                if (Intersectionf.intersectRayAab(center, dir, min, max, nearFar) && nearFar.x < chunkClosestDistance) {
                    chunkClosestDistance = nearFar.x;
                    selectedChunk = chunk;
                }
            }
        }

        if (selectedChunk != null) {
            Block block;
            Block selectedBlock = null;
            for (int i = 0; i < Chunk.getX(); ++i) {
                for (int j = 0; j < Chunk.getY(); ++j) {
                    for (int k = 0; k < Chunk.getZ(); ++k) {
                        block = selectedChunk.getBlock(i, j, k);
                        if (block == null) {
                            return null;
                        }
                        if (block.getType() != TextureManager.SOLID) continue;
                        min.set(block.getPosition());
                        max.set(block.getPosition());
                        max.add(1, 1, 1);
                        if (Intersectionf.intersectRayAab(center, dir, min, max, nearFar) && nearFar.x < blockClosestDistance) {
                            blockClosestDistance = nearFar.x;
                            selectedBlock = block;
                        }
                    }
                }
            }
            if (selectedBlock == null || blockClosestDistance >= 5) return null;
            else return selectedBlock.getPosition();
        } else {
            return null;
        }
    }
```

然后根据返回的block position，确定准心对准的方块是哪个。之后只要对fragment shader进行少许修改:

```c++
in vec3 worldCoord;

uniform int selected;
uniform vec3 selectedBlock;

bool check(vec3 sourcePos, vec3 targetPos) {
    // this checks whether source postion is the targetPos
    return (targetPos.x <= sourcePos.x && sourcePos.x <= targetPos.x + 1) &&
           (targetPos.y <= sourcePos.y && sourcePos.y <= targetPos.y + 1) &&
           (targetPos.z <= sourcePos.z && sourcePos.z <= targetPos.z + 1);
}

void main() {
	// other processes
    if (selected == 1 && check(worldCoord, selectedBlock)) {
        fragColor = vec4(1, 1, 1, 2) - fragColor;
    }
}
```

就能够让被选中的方块反色啦！

![CameraSelectionDetection](CameraSelectionDetection.png)

以及正在考虑要怎么在被选中方块的周围画上一圈黑色的线框。

感觉下一步大概是把准心做出来。之后应该就是方块的放置和破坏啦。

## 2019/07/10

结果没有做准心，倒是先把线框做出来了:

![SelectionImproved](SelectionImproved.png)

采用反色的话确实有点出戏，所以我想也许还是换成黑色线框比较好2333。

这个改起来倒是非常方便啦，只要去fragmentShader里稍作修改就可以了。

倒是在改的过程中发现了不少bug。比方说在区块边界的时候，会没有办法选中另一个区块的方块。这是因为之前的代码先确定了最近的chunk，之后才在这个chunk里寻找符合条件的方块。

但是有的时候这个方块并不在离你最近的chunk里。所以只能枚举chunk了...

```java
    private Vector3f selectBlock(Chunk[][] chunks, Vector3f center, Vector3f dir) {
        Block block;
        Block selectedBlock = null;
        float blockClosestDistance = Float.POSITIVE_INFINITY;

        for (Chunk[] chunkList : chunks) {
            for (Chunk chunk : chunkList) {
                min.set(chunk.getPosition());
                max.set(chunk.getPosition());
                max.add(Chunk.getX(), Chunk.getY(), Chunk.getZ()); // the size of chunk
                if (Intersectionf.intersectRayAab(center, dir, min, max, nearFar)) {
                    float dist = ((chunk.getx() << 4) + 8 - center.x) * ((chunk.getx() << 4) + 8 - center.x) +
                                 ((chunk.getz() << 4) + 8 - center.z) * ((chunk.getz() << 4) + 8 - center.z);
                    if (dist > 266.13708498984755) continue; // (8 * (2 ** .5) + 5) ** 2
                    for (int i = 0; i < Chunk.getX(); ++i) {
                        for (int j = 0; j < Chunk.getY(); ++j) {
                            for (int k = 0; k < Chunk.getZ(); ++k) {
                                block = chunk.getBlock(i, j, k);
                                if (block == null) {
                                    return null;
                                }
                                if (block.getType() != TextureManager.SOLID) continue;
                                min.set(block.getPosition());
                                max.set(block.getPosition());
                                max.add(1, 1, 1);
                                if (Intersectionf.intersectRayAab(center, dir, min, max, nearFar) && nearFar.x <= 5 && nearFar.x < blockClosestDistance) {
                                    blockClosestDistance = nearFar.x;
                                    selectedBlock = block;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (selectedBlock == null) return null;
        else return selectedBlock.getPosition();
    }
```

为了保证效率，首先会确定这个Chunk是否与你的视线相交。如果相交那说明这个方块可能在这个Chunk里。否则就直接跳过。

然后，计算一下Chunk到相机坐标的距离。大于一个定值就说明我们指向的方块一定不在这个Chunk里。这是很好理解的:

![Distance](Distance.png)

而且在视距不那么大的情况下，我想应该是不存在溢出的风险的。所以可以算是一个非常安定的剪枝。同时也避免了平方根，在一定程度上保证了效率。

~~我也写出magic number啦！~~

---

在上面的检测基础上，又对代码进行了一点更改:

```java
for (int i = 0; i < Chunk.getX(); ++i) {
    for (int j = (int) Math.max(center.y - 6, 0); j < (int) Math.min(center.y + 6, Chunk.getY()); ++j) {
        for (int k = 0; k < Chunk.getZ(); ++k) {
            if (manhattan_distance((chunk.getx() << 4) + i, (chunk.getz() << 4) + k, center.x, center.z) > 5) continue;
```

首先显而易见的是如果y轴超过太远就没有办法放置方块了。所以多余的y方向可以删除。其次，对于那些曼哈顿距离超过5的方块也可以直接放弃。

这样，每次渲染时最多只需要判断600个方块就可以找到候选方块了。相比加入这两个优化前要寻找10000+个方块来说已经要好多了。

同时从lwjgl book的源代码里偷来了准心:

```java
    private void renderCrossHair(Window window) {
        glPushMatrix();
        glLoadIdentity();

        float vertical = 0.03f;
        float horizontal = vertical * (float) (window.getHeight()) / window.getWidth();
        glLineWidth(2);

        glBegin(GL_LINES);

        glColor3f(1.0f, 1.0f, 1.0f);

        // Horizontal line
        glVertex3f(-horizontal, 0.0f, 0.0f);
        glVertex3f(+horizontal, 0.0f, 0.0f);
        glEnd();

        // Vertical line
        glBegin(GL_LINES);
        glVertex3f(0.0f, -vertical, 0.0f);
        glVertex3f(0.0f, +vertical, 0.0f);
        glEnd();

        glPopMatrix();
    }
```

当然原版的横线和竖线的长度还是不同的。这里也算是魔改了一下。

来看一下效果:

![CrossHair](CrossHair.png)

准心做不到MC那样反色总归还是有点令人感觉可惜的。但是也没办法了。

既然已经有准心了，接下来就是做方块的破坏了。

终于要引入这个游戏的灵魂啦！

---

然后实现了拆拆拆:

![digging](digging.png)

顺便引入了Cool Down机制。现在每次破坏完一个方块后都有200ms的冷却时间。

显然接下来的重点就是实现破坏方块的粒子效果啦！

## 2019/07/11

感觉加了方块破坏却不加方块放置有点不好。所以花了点时间把方块放置写好了:

![meq](meq.png)

计算法向量稍微有点点麻烦，不过还是能够写出来的:

```java
    private boolean checkFace(Vector3f center, Vector3f dir, Vector3f a, Vector3f b, Vector3f c, Vector3f d) {
        return Intersectionf.intersectRayTriangleFront(center, dir, a, d, b, 0) != -1 ||
               Intersectionf.intersectRayTriangleFront(center, dir, b, d, c, 0) != -1;
    }

    private Vector3f getNormalVector(Vector3f blockPosition, Vector3f center, Vector3f dir) {
        // iterate over all faces and determine which is the closest.
        if (blockPosition == null) return null;
        Vector3f a = new Vector3f(blockPosition.x    , blockPosition.y    , blockPosition.z    ),
                 b = new Vector3f(blockPosition.x    , blockPosition.y    , blockPosition.z + 1),
                 c = new Vector3f(blockPosition.x    , blockPosition.y + 1, blockPosition.z + 1),
                 d = new Vector3f(blockPosition.x    , blockPosition.y + 1, blockPosition.z    ),
                 e = new Vector3f(blockPosition.x + 1, blockPosition.y    , blockPosition.z    ),
                 f = new Vector3f(blockPosition.x + 1, blockPosition.y    , blockPosition.z + 1),
                 g = new Vector3f(blockPosition.x + 1, blockPosition.y + 1, blockPosition.z + 1),
                 h = new Vector3f(blockPosition.x + 1, blockPosition.y + 1, blockPosition.z    );
        if (checkFace(center, dir, b, a, d, c)) return new Vector3f(-1, 0, 0);
        if (checkFace(center, dir, a, e, h, d)) return new Vector3f(0, 0, -1);
        if (checkFace(center, dir, e, f, g, h)) return new Vector3f(1, 0, 0);
        if (checkFace(center, dir, f, b, c, g)) return new Vector3f(0, 0, 1);
        if (checkFace(center, dir, h, g, c, d)) return new Vector3f(0, 1, 0);
        if (checkFace(center, dir, a, b, f, e)) return new Vector3f(0, -1, 0);
        return null;
    }
```

感觉越来越像是面向复制粘贴的编程了。

---

然后调了半天总算是把粒子给做好了:

![particles](particles.gif)

虽然相比原版来说还是有些不同，不过已经还算说得过去啦。

接下来打算简单重构一下，把课程中教的工厂模式应用到项目里。~~纯粹是为了给老师一点面子吧。~~

---

![randomFaceAndRealParticle](randomFaceAndRealParticle.png)

现在粒子看起来更加真实了。首先，破坏之后粒子显示的不再是一整个面，而是从原图上随机采样的几个点。

其次增加了对方块的碰撞检测。也就是说，如果粒子碰到了方块，就会停下来。这比之前的无视一切实体方块直接下落要好多了。

同时，粒子的寿命也被改善了。之前，它的寿命是服从uniform distribution的:

```java
(long) Math.random() * 3000
```

为了让大部分粒子的生命短一些，有个简单的办法:

```java
(long) (Math.pow(Math.random(), 5) * 3000)
```

粒子部分差不多到这也就结束了。

## 2019/07/12

队友的新地形生成器merge到主分支啦！展示一下效果:

![NewTerrainGeneration](NewTerrainGeneration.png)

![NewTerrainGeneration2](NewTerrainGeneration2.png)

突然有了抱大腿的感觉（笑）

不过性能非常糟糕。测试下来，应该是因为整个游戏是单线程的。

所以接下来要把renderer单独拆出去作为一个线程来对chunks进行渲染。看起来终于要用到操作系统的知识了。

---

看起来把renderer拆出去作为一个单独的线程一点用都没有。大概是已经到了集显的尽头了吧（其实就是优化太菜）

于是想了点办法把GPU换成了独显，卧槽瞬间丝般顺滑！英伟达牛逼！

贴一张400区块，30FPS的截图:

![NVIDIA](NVIDIA.png)

当然为了好看把背景P成了美丽的白色。看起来就像每一个朦胧且美丽的雾天一样。

我立刻原地去世，这已经能当壁纸了罢！

~~抱大腿的感觉真好...~~

## 2019/07/13

睡醒就中午了。组里有一场camp选拔赛，于是一下午就过去了。

差不多两个月没打ACM了，体验确实是非常差。当然自己菜也是一大原因。

然后修复了一下换成独显之后在FragmentShader中计算方块侧面阴影时产生的条纹。

队友在做动态地图。目前已经做到把地图存在外存里了。不过还是会有一些卡顿，所以还需要再继续进行改进。

然后就莫名其妙到了第二天凌晨。生产力低下。

## 2019/07/14

相比前一周，这一周真是什么都没做，全靠大佬队友带飞。

正好到了Camp报名的时候，权衡了很久最后还是选择不去。其实回过头来好好想一想就会发现，自己其实并不清楚自己为什么要打ACM。好像以前想到这个问题的时候，我都会下意识回避掉。

我很热爱算法吗? 不。我只对优秀的性能感兴趣，至于算法本身的美感，我很少能够体会得到。

我喜欢竞技吗? 不。我不喜欢与人竞争，因为这太累，同时也调动太多的感情。然而现实就是需要不断地与所有人进行竞争，通过做到别人做不到的事情，来换取大家都想要的东西。

我喜欢旅行吗? 不。我不喜欢不熟悉的环境，尤其是当它们还使人感到不适的时候。

我喜欢团队合作吗? 不。我不喜欢与人交流，人类之间要互相理解实在太困难了。之前区域赛就多少在和队友抢键盘。

我喜欢挑战难题吗? 这取决于题目是否有趣，或者是否非常现实。然而大多数ACM的题目其实并不那么有趣。

然后回过头来仔细想想，ACM中的知识能够应用到工作中的又有多少呢? 最近做minecrash，我不断地思考哪里可以怎样用ACM中的知识来优化，但是事实上用的最多的却是最简单的单链表。最复杂的，可能也只是Simplex Noise，而它更像是玄学调参，就像机器学习所做的那样。在实际工程中，可能甚至连课内教的数据结构都只会用到一小部分。

现实中不会有那么多的区间和那么多的询问让你修改，也不会让你用字典树来维护权值，也不会大费周章让你写个segment tree beat。它不可靠，维护性极差，也不是原子的。相比之下，连接一个数据库，丢个`executeUpdate()`过去，一切就都结束了。

到底是我的水平太低，还是确实ACM过于纸上谈兵呢?

而且，ACM打了那么久，我依然不能针对应用场景来设计最优的算法。像是一年前做推箱子的时候，我就不知道要从何下手。简单地应用BFS的后果就是只有40步的最优解都需要花上20多秒才能搜出来。而别人90多页的启发式算法的论文我又怎么都理解不了它的核心想法。

我觉得我学到的知识都是死的。面对只有30帧的minecrash，除了打开Google，然后搜索类似于`minecraft optimization rendering`的内容之外，我想不到任何让它变得更快的方法。

我好像总是在问题的表面打转，而就是做不到像利刃那样，穿破表面，直指问题核心。是不是所有这些问题，都可以用粗暴无脑的一句 *"去学习啊"* 就能解决呢?

---

想要提升阴影质量。所以我决定把Cascade Shadow Map做了。

 肝了一晚上，最后虽然能跑了，但是bug很严重。

首先确定了Cascade split是正确的:

![CascadeSplit](CascadeSplit.png)

红色表示这属于最近的Shadow Cascade中，绿色表示稍远，蓝色表示最远。

很奇怪的一点就是影子只有在正午附近才能显示。同时，似乎在头顶以上部分的方块不会被算入阴影内。说明教程本身的OrthoProjectionMatrix的计算有错误。

---

于是把教程的正投影矩阵给日了，换成了自己的无脑投影。于是得到了类似于下图的神奇结果:

![cascadeShadow](cascadeShadow.png)

红色区域内的阴影的质量是最高的，绿色其次，蓝色最差。从这张图里可以清晰的看到红色部分内的阴影的边界比绿色部分内的阴影的边界要更加清晰。

但是有个神奇的问题就是换成独显之后，影子就没了！

---

浪费了一晚上在给独显debug，最后发现是教程里面`ArrayTexture`里面创建shadow map texture的时候的参数错了。

于是现在阴影质量也算是提上去了。相比一周之前，几乎没有任何画质上的改动，看起来像是这一周什么都没做...

![CascadeShadowMapFinish](CascadeShadowMapFinish.png)

![CascadeShadowMapFinish2](CascadeShadowMapFinish2.png)

这周就到此结束了。下一周只有一两天会拿来开发，因为周五就要答辩了，而写的东西又太多了，可能要准备很久，所以必须空出足够多的时间来应对意料之外的情况。

我想，下周可能会先把性能问题解决一下吧。之后可能稍微简单地实现一下物品系统和物品栏，然后就要开始准备答辩了。小学期也就要结束了啊。

## References

- Terrain generation:
    - https://notch.tumblr.com/post/3746989361/terrain-generation-part-1
    - https://github.com/UnknownShadow200/ClassiCube/wiki/Minecraft-Classic-map-generation-algorithm
- http://codeflow.org/entries/2010/dec/09/minecraft-like-rendering-experiments-in-opengl-4/#more-interesting-noise
- Object picking:
    - https://ahbejarano.gitbook.io/lwjglgamedev/chapter23
    - http://antongerdelan.net//opengl/raycasting.html
- Particles:
    - https://ahbejarano.gitbook.io/lwjglgamedev/chapter20
