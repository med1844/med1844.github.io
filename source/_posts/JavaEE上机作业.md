---
title: JavaEE上机作业
date: 2019-09-18 22:02:21
tags: [java, python]
mathjax: true
---

本来我觉得没有必要为一门两学分的课专门开一篇文章，不过现在这门课用上机作业告诉我，确实是我想多了。相比之下，小学期的minecrash简直就是弟弟。

看着新生群里那些连hello world都吃力的孩子们，有种莫名的羡慕。

## 第一次作业

总的来说就是实现一个搜索引擎，名为"软院找人"。当然因为数据量相当小，所以其实效率方面不用特别担心。

首先是定义学生的信息，包括姓名，学号，电话，QQ，以及邮箱，一共5个字段。

学号是主码。~~不过话说回来，既然是用txt或者xlsx存储，那应该也用不着数据库吧...~~

不限制内存的使用，但是一定要确保性能。

必须支持模糊搜索，但不必支持到subsequence的程度（substring即可）

### 存储结构的设计

为了确保查询效率，我思考了很多实现方案。但是既然要模糊搜索，那么肯定要涉及到字串匹配了。

如果不是模糊搜索的话，直接5个字典就完事了。

字串匹配，最经典的KMP，还有一些其他的启发式算法，再怎么样复杂度也都是$\mathcal{O}(n + m)$的水准。为了能够把所有信息搜出来，显然每次查询都要把所有的学生数据都跑一遍。这样，每次查询的复杂度就是$\mathcal{O}(\sum_i s_i + |s| \times m)$，其中sum是所有学生信息的长度总和，而$|s|$是学生信息的条数。

这等于每次查询都要把每个表都跑一遍才行，我反正是觉得这样不太好...

所以最后我觉得还是应该考虑使用Trie树。当然肯定就有人会感到好奇，Trie树怎么实现模糊查询呢?

以前在自学后缀数组的时候，学到了一个非常重要的概念:

>  *所有的substring都是某个后缀的某个前缀*

听起来有点拗口，总归来个简单例子帮助理解:

对于字符串`abcabedcf`，`abed`是后缀`abedcf`的前缀，`cab`是`cabedcf`的一个前缀。

**于是要利用只能查询前缀的Trie树来查询SubString，只需要把字符串的每个后缀都放进Trie树里就好了。**

### 查询效率迷思

作为一个ACM半途而废的菜鸡，分析时间复杂度的功夫一直不到家。不过尝试总归还是要尝试的！

采用Trie树的话，插入一条长度为$|s|$的数据的时间复杂度是$\mathcal{O}(|s|^2)$级别的。而查询一条长度为$|q|$的关键字，并且以关键字末端节点为根节点的子树里一共有$n$个节点的话，则时间复杂度是$\mathcal{O}(|q| + n)$的。

听起来很拗口，总归上图:

![Trie](JavaEE上机作业\Trie.png)

这张图中黑色的结点表示根据关键字`hhkb`，从根节点出发所走的路径。灰色三角形表示该节点的其他子树。红色节点表示关键字末端节点。红色三角形表示关键字末端节点的所有子树。

那么对于关键字`hhkb`，$|q| = 4$，$n$等于红色三角形中，所有节点的个数。

我想，采用这种方法，跟暴力KMP匹配的效率相比，关键就是那些灰色三角形: **无脑KMP则会导致试图匹配灰色三角形中的字符串，而Trie树根本不会考虑去那些子树里查询答案。**

也就是说，我相信采用Trie树来存储数据并用于处理查询的效率能够比KMP要高，就是因为Trie树直接抛弃了那些灰色三角形，自带剪枝效果。

*但是实际效率到底是不是真的比无脑KMP要快呢?* 通常来说应该做实验来确定，但是~~因为我写的代码的耦合性还是太强了，分离查询部分出去，再替换成另一种查询，是非常麻烦的，再加上~~因为太懒了，所以最后还是决定就偷懒吧。

代码就不贴了。这部分内容是非常简单的。

## 第二次作业

相对前一次增加了分页功能，同时需要支持定义每页的结果显示条数。

唯一一个重点就是使用session来保存查询结果。总不能每次都在调用`service(request, response)`的时候都查询一次。同时因为有多个用户同时查询的可能性，也不能存储在类里。这样看下来就必须放在session里。

所以实际上这次作业就是帮助练习HttpSession，其他的部分基本上稍微思考一下就能完成。

```java
package io.github.medioqrity;

// import ...

@WebServlet("/query")
public class StudentQueryServlet extends HttpServlet {

    // omitted
    
    public void doGet(HttpServletRequest req, HttpServletResponse res) 
    throws ServletException, IOException {
        doPost(req, res);
    }

    public void doPost(HttpServletRequest req, HttpServletResponse res) 
    throws ServletException, IOException {
        res.setContentType("text/html; charset=UTF-8");
        req.setCharacterEncoding("UTF-8");
        res.setCharacterEncoding("UTF-8");

        String keyword = req.getParameter("keyword");
        HttpSession session = req.getSession();

        int pageNumber = getIntParameter(req, "page", 0);
        int resultCountPerPage = COUNT_PER_PAGE_DEFAULT;

        // for security issues. e.g.: negative count per page
        if (session.getAttribute("resultCountPerPage") != null) {
            resultCountPerPage = (Integer) session.getAttribute("resultCountPerPage");
        }
		// omitted
    }
}

```

总得来说基本没什么难度，但还是写了挺久才确保没有太严重的bug，同时确保用户体验免于太差。

在生成页码方面采用了AtCoder的策略，也就是二次幂增长:

```java
        // generate link
        Set<Integer> pages = new TreeSet<>();
        int cur = pageNumber, step = 1;
        while (cur >= 0) {
            pages.add(cur);
            cur -= step;
            step <<= 1;
        }
        pages.add(0);

        cur = pageNumber; step = 1;
        while (cur < totalPageCount) {
            pages.add(cur);
            cur += step;
            step <<= 1;
        }
        pages.add(totalPageCount - 1);

        out.println("<p>");
        for (int i : pages) {
            // do something
        }
```

最后得到的结果也确实非常令人满意:

![result](JavaEE上机作业\result.png)

*因为数据是基于真实信息及其结构随机产生的，所以为了避免任何暴露真实信息的可能性，把较为敏感的部分全部打码了。*

要说坑的话大概就是做好设置数据条数的表单之后手贱输了个`-1`进去，结果还真崩了。检查上机作业的时候跟老师讲了一下，估计坑害了不少后面检查的小朋友，总之听说后来检查时老师甚至要求往这个框里输中文进去，然后不少小朋友就直接喜提`500`了。

解决方案也挺简单的，正好能用到CS143里学的RE:

```java
@WebServlet("/query")
public class StudentQueryServlet extends HttpServlet {

    private void generatePage(String keyword, List<Integer> result, HttpServletResponse res, 
                              int pageNumber, int resultCountPerPage) throws IOException {
        
        // ...
        
        out.println("<form action='query' method='get'>Change the record count per page: <input type='hidden' name='keyword' value=" + 
                    keyword + "><input type='text' name='countPerPage' value=" + resultCountPerPage + " pattern=\"[0-9]*\"><input type='submit'></form>");
        
        // ...
        
    }
```

就是`input`元素中的`pattern`属性，放个正则表达式就完事啦！

这是前端的防御，当然后端也要防御一下空白或者0的情况:

```java
@WebServlet("/query")
public class StudentQueryServlet extends HttpServlet {
    
    public void doPost(HttpServletRequest req, HttpServletResponse res) 
    throws ServletException, IOException {
        // ...

        // for security issues. e.g.: negative count per page
        if (session.getAttribute("resultCountPerPage") != null) {
            resultCountPerPage = (Integer) session.getAttribute("resultCountPerPage");
        }
        if (req.getParameter("countPerPage") != null) {
            try {
                resultCountPerPage = verify(Integer.parseInt(req.getParameter("countPerPage")), resultCountPerPage);
                session.setAttribute("resultCountPerPage", resultCountPerPage);
            } catch (Exception e) {
                // do nothing
            }
            if (session.getAttribute("resultCountPerPage") != null) {
                resultCountPerPage = (Integer) session.getAttribute("resultCountPerPage");
            } else {
                resultCountPerPage = COUNT_PER_PAGE_DEFAULT;
            }
        }

        // ...
    }
}
```

## 开发环境

这当然不算是作业。但是我觉得完全可以记录一下自己的开发环境－－毕竟eclipse真的太烂了。

每个用过的人都会明白eclipse是多么差劲的一个IDE。如果说intellij之类合格的IDE可以提升开发效率，那么eclipse就完美地处在这些IDE的反面: 

- 便秘一般的代码补全体验

    触发代码补全居然要输入`.`才行? 合着类型或者特别长的变量名就不用补全了呗?

- 人工智障般的代码提示功能

    把触发代码补全的关键char改成所有字母之后，你就会发现－－输一个字符卡一次。

    而且，看到它给你提示的内容，你就明白为什么eclipse默认只有在输入`.`的时候才提供代码补全了。

- 慢到令人绝望的启动速度

- XP时代的丑陋UI

- 响应速度同样慢到令人绝望的UI组件

- 不自动编译

- 对vim支持极差

所以最后我毅然决然继续小学期时的操作，抛弃eclipse，转投其他编辑工具。鉴于Java EE的开发需要使用Ultimate版的intellij，而我懒得去申请免费学生版，所以最后还是选择了VSCode + maven + tomcat。

![IDE](JavaEE上机作业\IDE.png)

颜值就不说了，是个人都能看出来是吊打eclipse的水平。而且它的vim插件对于我这种菜鸟来说已经足够了。

而配合微软官方推出的Java Extension Pack，以及Maven来管理编译和dependency方面的工作，不论是代码提示还是编译运行都非常方便。

![CodeCompletion](JavaEE上机作业\CodeCompletion.png)

甚至可以用内嵌terminal完成编译:

![build](JavaEE上机作业\build.png)

唯一的缺点大概就是每次生成war文件后都要手动复制到tomcat服务器的webapp文件夹下。当然这也可以通过写一个简单的后台小脚本来解决:

```python
import os
import time
from win10toast import ToastNotifier
from shutil import copyfile


SOURCE = "C:/School/JavaEE/Assignment_5/Assignment_5/ear/target/ear-1.0-SNAPSHOT/"
DEST = [
    "C:/Users/?????/Downloads/Compressed/apache-tomcat-9.0.24/webapps/", 
    "C:/Users/?????/Downloads/Compressed/apache-tomcat-9.0.25/webapps/"
]
FILE_NAME = "io.github.medioqrity-servlet-1.0-SNAPSHOT.war"


def get_modification_time(PATH):
    try:
        return os.path.getmtime(PATH)
    except OSError:
        return 0


def notify_update(last_mod_time, mod_time):
    toast = ToastNotifier()
    toast.show_toast("Tomcat war updated", "New war file detected.\nOld modification time: %.2f\nNew modification time: %.2f\n" % 
                     (last_mod_time, mod_time))


def move():
    for dest in DEST:
        copyfile(SOURCE + FILE_NAME, dest + FILE_NAME)
        print("Copy %s ok..." % dest, end='')


last_modification_time = get_modification_time(SOURCE + FILE_NAME)
while True:
    modification_time = get_modification_time(SOURCE + FILE_NAME)
    print("Checking updates...", end='')
    if modification_time != last_modification_time:
        print("found new war file, ", end='')
        try:
            move()
            notify_update(last_modification_time, modification_time)
            last_modification_time = modification_time
            print("nothing wrong.")
        except:
            print("FAILURE OCCURED.")
            continue
        
    else:
        print("nothing changed.")
    time.sleep(5)
```


不论如何，总之最后的结果就是完美地避开了eclipse，可喜可贺。

## 第三次作业

实际上就是连上数据库就可以了。不过配数据库确实是比较麻烦的一件事情。

这里献祭出自己的`GenericDAO.java`来展示MSSQLServer的连接方法。

```java
package io.github.medioqrity;

import java.sql.*;

import com.microsoft.sqlserver.jdbc.*;

public class GenericDAO {

    protected SQLServerDataSource dataSource = null;

    public GenericDAO() {
        dataSource = new SQLServerDataSource();
        dataSource.setIntegratedSecurity(true);
        dataSource.setServerName("DESKTOP-???????");
        dataSource.setDatabaseName("master");
    }
}
```

核心就是通过Integrated Security连接就可以了。最难的部分还是读mssql-jdbc的文档，然后配置它。

成功配置好MSSQL之后，只能算完成了1/4的任务。首先，要做出登录和退出系统，并且还要根据用户权限来确定是否可以展示增删改查页面，剩下的增删改查，要全都写出来也不是那么容易的事情。

总归肝了大概一两天之后也算是写出来了:

![3and4](JavaEE上机作业\3and4.png)

这是管理员会看到的界面。在这里可以轻松地对数据进行更新。

左侧的照片栏是第四次作业的产物--很快就会讲它。

## 第四次作业

这一次作业听起来就非常牛逼: 实现人脸搜索。

也就是说，你首先要对增删改查的部分进行修改，新增上传文件的功能，同时也要对数据库进行修改，以支持图片的存储，最后你还要手写一个人脸识别和匹配的引擎。

虽然最后一步的引擎可以通过简单地调用各种网上现成的API就完事，但是这样就很没意思，所以我还是用python写了个调包侠脚本，作为一个服务来运行。

很有趣的一点就是要怎么实现一个服务呢? 毕竟大部分程序都是执行完就走了，但服务是一直运行直到收到请求为止。

很简单的一个想法就是一个无脑while，用标准输入输出流作为进程间通信的信道。于是就有如下代码:

```python
from face_recognition import face_distance, face_encodings, load_image_file
import os
import sys
from glob import glob
from PIL import Image
from numpy import fromfile, ndarray

def image_to_data_name(image_name):
    return image_name[:-4] + '.dat'


def get_file_name(path):
    assert isinstance(path, str)
    return '.'.join(path.split('\\')[-1].split('.')[:-1])


WORKING_DIRECTORY = sys.argv[1]
THRESHOLD = 0.5
MAX_RESULT = 10

known_faces = {}

while True:
    try:
        file_path = input()
    except EOFError:
        break

    for image_name in glob(WORKING_DIRECTORY + "*.jpg"):
        try:
            data_name = image_to_data_name(image_name)
            file_name = get_file_name(image_name)

            if file_name == 'temp':
                continue

            if file_name in known_faces:
                continue

            if os.path.isfile(data_name):
                known_faces[file_name] = fromfile(data_name)
            else:
                temp_encodings = face_encodings(load_image_file(image_name))
                if not temp_encodings:
                    continue
                temp_encoding = temp_encodings[0]
                temp_encoding.tofile(data_name)
                known_faces[file_name] = temp_encoding
        except:
            continue

    image = load_image_file(file_path)
    try:
        face_encoding = face_encodings(image)[0]
    except:
        # no face in this image.
        print(0)
        continue

    result = [(name, face_distance([face], face_encoding)[0]) for name, face in known_faces.items()]
    result.sort(key = lambda x: x[1])

    # use binary search to remove too far faces
    l, r = 0, len(result)
    while l < r:
        mid = (l + r) >> 1  # no overflow
        if result[mid][1] < THRESHOLD:
            l = mid + 1
        elif result[mid][1] == THRESHOLD:
            l, r = mid, mid
        else:
            r = mid
    assert l == r
    n = min(l, MAX_RESULT, len(result))
    print(n)
    for name, distance in result[:n]:
        print(name)
        print(distance)
    sys.stdout.flush()
```

这样，不太容易放进数据库的128维的人脸特征向量，就可以被单独管辖了。当然这样就可能导致产生数据不一致性的情况，这在当时写的时候也没有太深入考虑，现在一想确实还是太年轻了。

然后，在搜索的servlet里，创建一个python进程即可。首先，新建一个进程成员:

```java
package io.github.medioqrity;

// import

@WebServlet("/ImageSearch")
@MultipartConfig
public class ImageSearchServlet extends HttpServlet {

    private static final long serialVersionUID = 5445154266585224261L;
    private Process python;
    private BufferedReader reader;
    private BufferedWriter writer;

}
```

接下来初始化的时候初始化一个进程，并记录其输入与输出:

```java
    @Override
    public void init() {
        System.out.println("PATH: " + getServletContext().getRealPath(IMAGE_DIRECTORY));
        try {
            python = Runtime.getRuntime().exec(
                "python " + 
                getServletContext().getRealPath(RECOGNIZOR_DIRECTORY + RECOGNIZOR_NAME) + " " +
                getServletContext().getRealPath(IMAGE_DIRECTORY)
            );
            reader = new BufferedReader(new InputStreamReader(python.getInputStream()));
            writer = new BufferedWriter(new OutputStreamWriter(python.getOutputStream()));
        } catch (IOException e){
            e.printStackTrace();
        }
        System.out.println("python: " + python);
    }
```

最后只要在处理请求的方法中协调进程间通信即可。

```java
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) 
    throws ServletException, IOException {
        Part filePart = request.getPart("file"); // comes from <input type="file" name="file">
        InputStream fileContent = filePart.getInputStream();
        byte[] buffer = new byte[fileContent.available()];
        fileContent.read(buffer);
        FileOutputStream out = new FileOutputStream(getServletContext().getRealPath(IMAGE_DIRECTORY + TEMP + ".jpg"));
        out.write(buffer);
        out.close();

        System.out.println("reader, writer: " + reader + " " + writer);

        writer.write(getServletContext().getRealPath(IMAGE_DIRECTORY + TEMP + ".jpg") + "\n");
        writer.flush();

        HttpSession session = request.getSession();

        List<String> ids = new LinkedList<>();
        List<Double> dists = new LinkedList<>();
        List<String> imgs = new LinkedList<>();

        String temp;
        while ((temp = reader.readLine()) == null);
        System.out.println(temp);
        int n = Integer.parseInt(temp);
        for (int i = 0; i < n; ++i) {
            String id = reader.readLine();
            ids.add(id);
            dists.add(Double.parseDouble(reader.readLine()));
            imgs.add("<img src='" + getServletContext().getContextPath() + IMAGE_DIRECTORY + id + ".jpg'>");
        }

        session.setAttribute("ids", ids);
        session.setAttribute("dists", dists);
        session.setAttribute("imgs", imgs);

        response.sendRedirect(getServletContext().getContextPath() + "/ImageSearchResult.jsp");
    }
}
```

这样就可以完美地实现人脸搜索的功能了。可喜可贺。花了我好几天才写出来。

## 第五/六次作业

两次作业合并了。

由于CCSP的缘故，留给这最后一次作业的时间真的不怎么多。

要点就几个，首先是配置https，其次要使用nginx实现负载均衡。最后要实现一个简单的投票系统，要求防止刷票。

这个其实还蛮简单的，因为你只需要配置好环境（两台tomcat，nginx的分流设置等），之后的部分其实不算太难。

在开始实现之前，简单地绘制了一下流程图，基本上工作流程也就非常明晰了:

![VOTE_4](JavaEE上机作业\VOTE_4.png)

身份认证的部分，主要目的是为了防止刷票，对于不想沾染过多第三方API的人来说，余下的选择里，最简单的当然就是验证码了。

在深度学习横行的现在，我想一张小小的验证码并不能起到什么阻挡的作用。所以，在这里它更多的是象征意义:

![VOTE_3](JavaEE上机作业\VOTE_3.png)

投票之类的当然也是存在数据库里啦！投票的界面就像之前一样，没有CSS，非常干瘪，大家都想象得到，就不贴了。

最后贴一张验证码生成器的截图吧:

![VOTE_1](JavaEE上机作业\VOTE_1.png)

完结撒花。