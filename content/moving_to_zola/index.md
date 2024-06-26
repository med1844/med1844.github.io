+++
title = "Moving to zola"
date = 2024-06-03
+++

I've used Hexo for five years and am unhappy with it. Here are some reasons why:

- To add an image, you have to first create a folder with the same name as the markdown file, then put files into it. On top of that, you must install plugins to rename image path, and only image. This is absurd. A modern solution is to create a folder with an `index.md` and other resources.
- Hexo's default syntax highlighting library, highlight.js, sucks at highlighting Rust and Python. `prism.js` and `syntect` are slightly better, but still not as good as what an IDE would display. I tried [`tree-sitter-highlight`](https://github.com/tree-sitter/tree-sitter/tree/master/highlight) to generate HTML and found it also fails to provide good highlighting without LSP information. Code is important for tech blogs and it's worth a better display. Eventually, it turns out that [`Shiki`](https://shiki.style/) is the better option. It can be easily integrated into Zola via CDN or as a hexo [plugin](https://github.com/nova1751/hexo-shiki-plugin).
- I'm not familiar with javascript, and personally don't like it's language design choices. Better stay away from node.js dependency hell.

## Syntax highlighting comparisons

I would show the highlighting result of each library, sorted by preference score (higher the better), in ascending order. Due to the fact that not all themes are shared across libraries, I chosed `monokai`, one of the few theme that's available across all libraries, despite that it doesn't look good within the color scheme of this blog.

### Highlight.js

<style>
.highlight {
  background: #272822 !important;
  color: #ddd;
}
.highlight .tag,
.highlight .keyword,
.highlight .selector-tag,
.highlight .literal,
.highlight .strong,
.highlight .name {
  color: #f92672;
}
.highlight .code {
  color: #66d9ef;
}
.highlight .class .title {
  color: #fff;
}
.highlight .attribute,
.highlight .symbol,
.highlight .regexp,
.highlight .link {
  color: #bf79db;
}
.highlight .string,
.highlight .bullet,
.highlight .subst,
.highlight .title,
.highlight .section,
.highlight .emphasis,
.highlight .type,
.highlight .built_in,
.highlight .builtin-name,
.highlight .selector-attr,
.highlight .selector-pseudo,
.highlight .addition,
.highlight .variable,
.highlight .template-tag,
.highlight .template-variable {
  color: #a6e22e;
}
.highlight .comment,
.highlight .quote,
.highlight .deletion,
.highlight .meta {
  color: #75715e;
}
.highlight .keyword,
.highlight .selector-tag,
.highlight .literal,
.highlight .doctag,
.highlight .title,
.highlight .section,
.highlight .type,
.highlight .selector-id {
  font-weight: bold;
}
</style>
<pre class="highlight rust"><code><span class="line"><span class="keyword">pub</span> <span class="keyword">mod</span> graphics;</span><br><span class="line"><span class="keyword">pub</span> <span class="keyword">mod</span> theme;</span><br><span class="line"></span><br><span class="line"><span class="keyword">use</span> crate::theme::Theme;</span><br><span class="line"><span class="keyword">use</span> std::fs;</span><br><span class="line"><span class="keyword">use</span> std::fs::File;</span><br><span class="line"><span class="keyword">use</span> std::io::Write;</span><br><span class="line"><span class="keyword">use</span> toml::{Table, Value};</span><br><span class="line"><span class="keyword">use</span> tree_sitter_highlight::{Highlight, HighlightConfiguration, Highlighter, HtmlRenderer};</span><br><span class="line"></span><br><span class="line"><span class="keyword">fn</span> <span class="title function_">main</span>() <span class="punctuation">-&gt;</span> <span class="type">Result</span>&lt;(), std::io::Error&gt; {</span><br><span class="line">    <span class="keyword">let</span> <span class="variable">config_str</span> = fs::<span class="title function_ invoke__">read_to_string</span>(<span class="string">"catppuccin_mocha.toml"</span>).<span class="title function_ invoke__">expect</span>(<span class="string">"should be able to read"</span>);</span><br><span class="line">    <span class="keyword">let</span> <span class="variable">table</span> = config_str.<span class="title function_ invoke__">as_str</span>().parse::&lt;Table&gt;().<span class="title function_ invoke__">unwrap</span>();</span><br><span class="line">    <span class="keyword">let</span> <span class="variable">theme</span> = Theme::<span class="title function_ invoke__">from</span>(Value::<span class="title function_ invoke__">Table</span>(table.<span class="title function_ invoke__">clone</span>()));</span><br><span class="line"></span><br><span class="line">    <span class="keyword">let</span> <span class="variable">attrs</span>: <span class="type">Vec</span>&lt;_&gt; = theme</span><br><span class="line">        .highlights</span><br><span class="line">        .<span class="title function_ invoke__">iter</span>()</span><br><span class="line">        .<span class="title function_ invoke__">map</span>(|v| <span class="built_in">format!</span>(<span class="string">"style=\"{}\""</span>, v.<span class="title function_ invoke__">to_string</span>()))</span><br><span class="line">        .<span class="title function_ invoke__">collect</span>();</span><br><span class="line"></span><br><span class="line">    <span class="keyword">let</span> <span class="keyword">mut </span><span class="variable">highlighter</span> = Highlighter::<span class="title function_ invoke__">new</span>();</span><br><span class="line">    <span class="keyword">let</span> <span class="variable">lang</span> = tree_sitter_rust::<span class="title function_ invoke__">language</span>();</span><br><span class="line"></span><br><span class="line">    <span class="keyword">let</span> <span class="keyword">mut </span><span class="variable">config</span> = HighlightConfiguration::<span class="title function_ invoke__">new</span>(</span><br><span class="line">        lang,</span><br><span class="line">        <span class="string">"rust"</span>,</span><br><span class="line">        tree_sitter_rust::HIGHLIGHTS_QUERY,</span><br><span class="line">        <span class="built_in">include_str!</span>(<span class="string">"../queries/rust/injections.scm"</span>),</span><br><span class="line">        <span class="built_in">include_str!</span>(<span class="string">"../queries/rust/locals.scm"</span>),</span><br><span class="line">    )</span><br><span class="line">    .<span class="title function_ invoke__">unwrap</span>();</span><br><span class="line"></span><br><span class="line">    config.<span class="title function_ invoke__">condiv</span>(theme.<span class="title function_ invoke__">scopes</span>());</span><br><span class="line"></span><br><span class="line">    <span class="keyword">let</span> <span class="variable">source</span> = fs::<span class="title function_ invoke__">read_to_string</span>(<span class="string">"src/main.rs"</span>).<span class="title function_ invoke__">unwrap</span>();</span><br><span class="line">    <span class="keyword">let</span> <span class="variable">src_bytes</span> = source.<span class="title function_ invoke__">as_bytes</span>();</span><br><span class="line">    <span class="keyword">let</span> <span class="variable">highlights</span> = highlighter</span><br><span class="line">        .<span class="title function_ invoke__">highlight</span>(&amp;config, src_bytes, <span class="literal">None</span>, |_| <span class="literal">None</span>)</span><br><span class="line">        .<span class="title function_ invoke__">unwrap</span>();</span><br><span class="line"></span><br><span class="line">    <span class="keyword">let</span> <span class="keyword">mut </span><span class="variable">renderer</span> = HtmlRenderer::<span class="title function_ invoke__">new</span>();</span><br><span class="line">    <span class="keyword">let</span> <span class="variable">_</span> = renderer.<span class="title function_ invoke__">render</span>(highlights, src_bytes, &amp;|h: Highlight| attrs[h.<span class="number">0</span>].<span class="title function_ invoke__">as_bytes</span>());</span><br><span class="line"></span><br><span class="line">    <span class="keyword">let</span> <span class="keyword">mut </span><span class="variable">file</span> = File::<span class="title function_ invoke__">create</span>(<span class="string">"out.html"</span>)?;</span><br><span class="line">    file.<span class="title function_ invoke__">write_all</span>(</span><br><span class="line">        <span class="built_in">format!</span>(</span><br><span class="line">            <span class="string">"&lt;pre style=\"{} {}\"&gt;&lt;code&gt;"</span>,</span><br><span class="line">            theme.<span class="title function_ invoke__">get</span>(<span class="string">"ui.background"</span>).<span class="title function_ invoke__">to_string</span>(),</span><br><span class="line">            theme.<span class="title function_ invoke__">get</span>(<span class="string">"ui.text"</span>).<span class="title function_ invoke__">to_string</span>()</span><br><span class="line">        )</span><br><span class="line">        .<span class="title function_ invoke__">as_bytes</span>(),</span><br><span class="line">    )?;</span><br><span class="line">    file.<span class="title function_ invoke__">write_all</span>(&amp;renderer.html)?;</span><br><span class="line">    file.<span class="title function_ invoke__">write_all</span>(<span class="string">b"&lt;/code&gt;&lt;/pre&gt;"</span>)?;</span><br><span class="line">    <span class="title function_ invoke__">Ok</span>(())</span><br><span class="line">}</span><br><span class="line"></span><br></code></pre>

### Syntect

<style>
code {
  background-color: transparent !important;
  padding: 0 !important;
}
</style>

<pre style="background-color:#272822;color:#f8f8f2;" class="language-rust "><code class="language-rust"><span style="color:#f92672;">pub </span><span style="font-style:italic;color:#66d9ef;">mod </span><span>graphics;
</span><span style="color:#f92672;">pub </span><span style="font-style:italic;color:#66d9ef;">mod </span><span>theme;
</span><span>
</span><span style="color:#f92672;">use crate</span><span>::theme::Theme;
</span><span style="color:#f92672;">use </span><span>std::fs;
</span><span style="color:#f92672;">use </span><span>std::fs::File;
</span><span style="color:#f92672;">use </span><span>std::io::Write;
</span><span style="color:#f92672;">use </span><span>toml::{Table, Value};
</span><span style="color:#f92672;">use </span><span>tree_sitter_highlight::{Highlight, HighlightConfiguration, Highlighter, HtmlRenderer};
</span><span>
</span><span style="font-style:italic;color:#66d9ef;">fn </span><span style="color:#a6e22e;">main</span><span>() -&gt; </span><span style="font-style:italic;color:#66d9ef;">Result</span><span>&lt;(), std::io::Error&gt; {
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let</span><span> config_str </span><span style="color:#f92672;">= </span><span>fs::read_to_string(</span><span style="color:#e6db74;">"catppuccin_mocha.toml"</span><span>).</span><span style="color:#66d9ef;">expect</span><span>(</span><span style="color:#e6db74;">"should be able to read"</span><span>);
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let</span><span> table </span><span style="color:#f92672;">=</span><span> config_str.</span><span style="color:#66d9ef;">as_str</span><span>().parse::&lt;Table&gt;().</span><span style="color:#66d9ef;">unwrap</span><span>();
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let</span><span> theme </span><span style="color:#f92672;">= </span><span>Theme::from(Value::Table(table.</span><span style="color:#66d9ef;">clone</span><span>()));
</span><span>
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let</span><span> attrs: </span><span style="font-style:italic;color:#66d9ef;">Vec</span><span>&lt;</span><span style="color:#f92672;">_</span><span>&gt; </span><span style="color:#f92672;">=</span><span> theme
</span><span>        .highlights
</span><span>        .</span><span style="color:#66d9ef;">iter</span><span>()
</span><span>        .</span><span style="color:#66d9ef;">map</span><span>(|</span><span style="font-style:italic;color:#fd971f;">v</span><span>| format!(</span><span style="color:#e6db74;">"style=</span><span style="color:#ae81ff;">\"{}\"</span><span style="color:#e6db74;">"</span><span>, v.</span><span style="color:#66d9ef;">to_string</span><span>()))
</span><span>        .</span><span style="color:#66d9ef;">collect</span><span>();
</span><span>
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let </span><span style="color:#f92672;">mut</span><span> highlighter </span><span style="color:#f92672;">= </span><span>Highlighter::new();
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let</span><span> lang </span><span style="color:#f92672;">= </span><span>tree_sitter_rust::language();
</span><span>
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let </span><span style="color:#f92672;">mut</span><span> config </span><span style="color:#f92672;">= </span><span>HighlightConfiguration::new(
</span><span>        lang,
</span><span>        </span><span style="color:#e6db74;">"rust"</span><span>,
</span><span>        tree_sitter_rust::</span><span style="color:#ae81ff;">HIGHLIGHTS_QUERY</span><span>,
</span><span>        include_str!(</span><span style="color:#e6db74;">"../queries/rust/injections.scm"</span><span>),
</span><span>        include_str!(</span><span style="color:#e6db74;">"../queries/rust/locals.scm"</span><span>),
</span><span>    )
</span><span>    .</span><span style="color:#66d9ef;">unwrap</span><span>();
</span><span>
</span><span>    config.</span><span style="color:#66d9ef;">configure</span><span>(theme.</span><span style="color:#66d9ef;">scopes</span><span>());
</span><span>
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let</span><span> source </span><span style="color:#f92672;">= </span><span>fs::read_to_string(</span><span style="color:#e6db74;">"src/main.rs"</span><span>).</span><span style="color:#66d9ef;">unwrap</span><span>();
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let</span><span> src_bytes </span><span style="color:#f92672;">=</span><span> source.</span><span style="color:#66d9ef;">as_bytes</span><span>();
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let</span><span> highlights </span><span style="color:#f92672;">=</span><span> highlighter
</span><span>        .</span><span style="color:#66d9ef;">highlight</span><span>(</span><span style="color:#f92672;">&amp;</span><span>config, src_bytes, </span><span style="font-style:italic;color:#66d9ef;">None</span><span>, |_| </span><span style="font-style:italic;color:#66d9ef;">None</span><span>)
</span><span>        .</span><span style="color:#66d9ef;">unwrap</span><span>();
</span><span>
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let </span><span style="color:#f92672;">mut</span><span> renderer </span><span style="color:#f92672;">= </span><span>HtmlRenderer::new();
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let </span><span style="color:#f92672;">_ =</span><span> renderer.</span><span style="color:#66d9ef;">render</span><span>(highlights, src_bytes, </span><span style="color:#f92672;">&amp;|</span><span>h: Highlight</span><span style="color:#f92672;">|</span><span> attrs[h.</span><span style="color:#ae81ff;">0</span><span>].</span><span style="color:#66d9ef;">as_bytes</span><span>());
</span><span>
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">let </span><span style="color:#f92672;">mut</span><span> file </span><span style="color:#f92672;">= </span><span>File::create(</span><span style="color:#e6db74;">"out.html"</span><span>)</span><span style="color:#f92672;">?</span><span>;
</span><span>    file.</span><span style="color:#66d9ef;">write_all</span><span>(
</span><span>        format!(
</span><span>            </span><span style="color:#e6db74;">"&lt;pre style=</span><span style="color:#ae81ff;">\"{} {}\"</span><span style="color:#e6db74;">&gt;&lt;code&gt;"</span><span>,
</span><span>            theme.</span><span style="color:#66d9ef;">get</span><span>(</span><span style="color:#e6db74;">"ui.background"</span><span>).</span><span style="color:#66d9ef;">to_string</span><span>(),
</span><span>            theme.</span><span style="color:#66d9ef;">get</span><span>(</span><span style="color:#e6db74;">"ui.text"</span><span>).</span><span style="color:#66d9ef;">to_string</span><span>()
</span><span>        )
</span><span>        .</span><span style="color:#66d9ef;">as_bytes</span><span>(),
</span><span>    )</span><span style="color:#f92672;">?</span><span>;
</span><span>    file.</span><span style="color:#66d9ef;">write_all</span><span>(</span><span style="color:#f92672;">&amp;</span><span>renderer.html)</span><span style="color:#f92672;">?</span><span>;
</span><span>    file.</span><span style="color:#66d9ef;">write_all</span><span>(</span><span style="font-style:italic;color:#66d9ef;">b</span><span style="color:#e6db74;">"&lt;/code&gt;&lt;/pre&gt;"</span><span>)</span><span style="color:#f92672;">?</span><span>;
</span><span>    </span><span style="font-style:italic;color:#66d9ef;">Ok</span><span>(())
</span><span>}
</span></code></pre>

### Tree-sitter

<pre style="color: rgb(248, 248, 242);background-color: rgb(39, 40, 34); color: rgb(248, 248, 242);"><code><span style="color: rgb(249, 38, 114);">pub</span> <span style="color: rgb(249, 38, 114);">mod</span> graphics<span style="color: rgb(248, 248, 242);">;</span>
<span style="color: rgb(249, 38, 114);">pub</span> <span style="color: rgb(249, 38, 114);">mod</span> theme<span style="color: rgb(248, 248, 242);">;</span>

<span style="color: rgb(249, 38, 114);">use</span> <span style="color: rgb(249, 38, 114);">crate</span><span style="color: rgb(248, 248, 242);">::</span>theme<span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">Theme</span><span style="color: rgb(248, 248, 242);">;</span>
<span style="color: rgb(249, 38, 114);">use</span> std<span style="color: rgb(248, 248, 242);">::</span>fs<span style="color: rgb(248, 248, 242);">;</span>
<span style="color: rgb(249, 38, 114);">use</span> std<span style="color: rgb(248, 248, 242);">::</span>fs<span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">File</span><span style="color: rgb(248, 248, 242);">;</span>
<span style="color: rgb(249, 38, 114);">use</span> std<span style="color: rgb(248, 248, 242);">::</span>io<span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">Write</span><span style="color: rgb(248, 248, 242);">;</span>
<span style="color: rgb(249, 38, 114);">use</span> toml<span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(248, 248, 242);">{</span><span style="color: rgb(166, 226, 46);">Table</span><span style="color: rgb(248, 248, 242);">,</span> <span style="color: rgb(166, 226, 46);">Value</span><span style="color: rgb(248, 248, 242);">}</span><span style="color: rgb(248, 248, 242);">;</span>
<span style="color: rgb(249, 38, 114);">use</span> tree_sitter_highlight<span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(248, 248, 242);">{</span><span style="color: rgb(166, 226, 46);">Highlight</span><span style="color: rgb(248, 248, 242);">,</span> <span style="color: rgb(166, 226, 46);">HighlightConfiguration</span><span style="color: rgb(248, 248, 242);">,</span> <span style="color: rgb(166, 226, 46);">Highlighter</span><span style="color: rgb(248, 248, 242);">,</span> <span style="color: rgb(166, 226, 46);">HtmlRenderer</span><span style="color: rgb(248, 248, 242);">}</span><span style="color: rgb(248, 248, 242);">;</span>

<span style="color: rgb(249, 38, 114);">fn</span> <span style="color: rgb(166, 226, 46);">main</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span> -&gt; <span style="color: rgb(166, 226, 46);">Result</span><span style="color: rgb(248, 248, 242);">&lt;</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">,</span> std<span style="color: rgb(248, 248, 242);">::</span>io<span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">Error</span><span style="color: rgb(248, 248, 242);">&gt;</span> <span style="color: rgb(248, 248, 242);">{</span>
    <span style="color: rgb(249, 38, 114);">let</span> config_str = fs<span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">read_to_string</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(230, 219, 116);">"monokai.toml"</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">expect</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(230, 219, 116);">"should be able to read"</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>
    <span style="color: rgb(249, 38, 114);">let</span> table = config_str<span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">as_str</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">parse</span><span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(248, 248, 242);">&lt;</span><span style="color: rgb(166, 226, 46);">Table</span><span style="color: rgb(248, 248, 242);">&gt;</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">unwrap</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>
    <span style="color: rgb(249, 38, 114);">let</span> theme = <span style="color: rgb(166, 226, 46);">Theme</span><span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">from</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(166, 226, 46);">Value</span><span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">Table</span><span style="color: rgb(248, 248, 242);">(</span>table<span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">clone</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>

    <span style="color: rgb(249, 38, 114);">let</span> attrs<span style="color: rgb(248, 248, 242);">:</span> <span style="color: rgb(166, 226, 46);">Vec</span><span style="color: rgb(248, 248, 242);">&lt;</span><span style="color: rgb(166, 226, 46);">_</span><span style="color: rgb(248, 248, 242);">&gt;</span> = theme
        <span style="color: rgb(248, 248, 242);">.</span>highlights
        <span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">iter</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span>
        <span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">map</span><span style="color: rgb(248, 248, 242);">(</span>|v| <span style="color: rgb(249, 38, 114);">format</span><span style="color: rgb(249, 38, 114);">!</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(230, 219, 116);">"style=\"{}\""</span><span style="color: rgb(248, 248, 242);">,</span> v<span style="color: rgb(248, 248, 242);">.</span>to_string<span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">)</span>
        <span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">collect</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>

    <span style="color: rgb(249, 38, 114);">let</span> <span style="color: rgb(249, 38, 114);">mut</span> highlighter = <span style="color: rgb(166, 226, 46);">Highlighter</span><span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">new</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>
    <span style="color: rgb(249, 38, 114);">let</span> lang = tree_sitter_rust<span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">language</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>

    <span style="color: rgb(249, 38, 114);">let</span> <span style="color: rgb(249, 38, 114);">mut</span> config = <span style="color: rgb(166, 226, 46);">HighlightConfiguration</span><span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">new</span><span style="color: rgb(248, 248, 242);">(</span>
        lang<span style="color: rgb(248, 248, 242);">,</span>
        <span style="color: rgb(230, 219, 116);">"rust"</span><span style="color: rgb(248, 248, 242);">,</span>
        tree_sitter_rust<span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">HIGHLIGHTS_QUERY</span><span style="color: rgb(248, 248, 242);">,</span>
        <span style="color: rgb(249, 38, 114);">include_str</span><span style="color: rgb(249, 38, 114);">!</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(230, 219, 116);">"../queries/rust/injections.scm"</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">,</span>
        <span style="color: rgb(249, 38, 114);">include_str</span><span style="color: rgb(249, 38, 114);">!</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(230, 219, 116);">"../queries/rust/locals.scm"</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">,</span>
    <span style="color: rgb(248, 248, 242);">)</span>
    <span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">unwrap</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>

    config<span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">configure</span><span style="color: rgb(248, 248, 242);">(</span>theme<span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">scopes</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>

    <span style="color: rgb(249, 38, 114);">let</span> source = fs<span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">read_to_string</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(230, 219, 116);">"src/main.rs"</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">unwrap</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>
    <span style="color: rgb(249, 38, 114);">let</span> src_bytes = source<span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">as_bytes</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>
    <span style="color: rgb(249, 38, 114);">let</span> highlights = highlighter
        <span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">highlight</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">&amp;</span>config<span style="color: rgb(248, 248, 242);">,</span> src_bytes<span style="color: rgb(248, 248, 242);">,</span> <span style="color: rgb(166, 226, 46);">None</span><span style="color: rgb(248, 248, 242);">,</span> |_| <span style="color: rgb(166, 226, 46);">None</span><span style="color: rgb(248, 248, 242);">)</span>
        <span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">unwrap</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>

    <span style="color: rgb(249, 38, 114);">let</span> <span style="color: rgb(249, 38, 114);">mut</span> renderer = <span style="color: rgb(166, 226, 46);">HtmlRenderer</span><span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">new</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>
    <span style="color: rgb(249, 38, 114);">let</span> _ = renderer<span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">render</span><span style="color: rgb(248, 248, 242);">(</span>highlights<span style="color: rgb(248, 248, 242);">,</span> src_bytes<span style="color: rgb(248, 248, 242);">,</span> <span style="color: rgb(248, 248, 242);">&amp;</span>|<span style="color: rgb(253, 151, 31);">h</span><span style="color: rgb(248, 248, 242);">:</span> <span style="color: rgb(166, 226, 46);">Highlight</span>| attrs<span style="color: rgb(248, 248, 242);">[</span>h<span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(174, 129, 255);">0</span><span style="color: rgb(248, 248, 242);">]</span><span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">as_bytes</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">;</span>

    <span style="color: rgb(249, 38, 114);">let</span> <span style="color: rgb(249, 38, 114);">mut</span> file = <span style="color: rgb(166, 226, 46);">File</span><span style="color: rgb(248, 248, 242);">::</span><span style="color: rgb(166, 226, 46);">create</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(230, 219, 116);">"out.html"</span><span style="color: rgb(248, 248, 242);">)</span>?<span style="color: rgb(248, 248, 242);">;</span>
    file<span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">write_all</span><span style="color: rgb(248, 248, 242);">(</span>
        <span style="color: rgb(249, 38, 114);">format</span><span style="color: rgb(249, 38, 114);">!</span><span style="color: rgb(248, 248, 242);">(</span>
            <span style="color: rgb(230, 219, 116);">"&lt;pre style=\"{} {}\"&gt;&lt;code&gt;"</span><span style="color: rgb(248, 248, 242);">,</span>
            theme<span style="color: rgb(248, 248, 242);">.</span>get<span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(230, 219, 116);">"ui.background"</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">.</span>to_string<span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">,</span>
            theme<span style="color: rgb(248, 248, 242);">.</span>get<span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(230, 219, 116);">"ui.text"</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">.</span>to_string<span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span>
        <span style="color: rgb(248, 248, 242);">)</span>
        <span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">as_bytes</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">,</span>
    <span style="color: rgb(248, 248, 242);">)</span>?<span style="color: rgb(248, 248, 242);">;</span>
    file<span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">write_all</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">&amp;</span>renderer<span style="color: rgb(248, 248, 242);">.</span>html<span style="color: rgb(248, 248, 242);">)</span>?<span style="color: rgb(248, 248, 242);">;</span>
    file<span style="color: rgb(248, 248, 242);">.</span><span style="color: rgb(166, 226, 46);">write_all</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(230, 219, 116);">b"&lt;/code&gt;&lt;/pre&gt;"</span><span style="color: rgb(248, 248, 242);">)</span>?<span style="color: rgb(248, 248, 242);">;</span>
    <span style="color: rgb(166, 226, 46);">Ok</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">(</span><span style="color: rgb(248, 248, 242);">)</span><span style="color: rgb(248, 248, 242);">)</span>
<span style="color: rgb(248, 248, 242);">}</span>
</code></pre>

### Prism.js

<style>
code[class*="language-"],
pre[class*="language-"] {
	color: #f8f8f2;
	background: none;
}

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
	background: #272822;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
	color: #8292a2;
}

.token.punctuation {
	color: #f8f8f2;
}

.token.namespace {
	opacity: .7;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
	color: #f92672;
}

.token.boolean,
.token.number {
	color: #ae81ff;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
	color: #a6e22e;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string,
.token.variable {
	color: #f8f8f2;
}

.token.atrule,
.token.attr-value,
.token.function,
.token.class-name {
	color: #e6db74;
}

.token.keyword {
	color: #66d9ef;
}

.token.regex,
.token.important {
	color: #fd971f;
}

.token.important,
.token.bold {
	font-weight: bold;
}
.token.italic {
	font-style: italic;
}

.token.entity {
	cursor: help;
}
</style>
<pre class="language-rust" tabindex="0"><code class="language-rust"><span class="token keyword">pub</span> <span class="token keyword">mod</span> <span class="token module-declaration namespace">graphics</span><span class="token punctuation">;</span>
<span class="token keyword">pub</span> <span class="token keyword">mod</span> <span class="token module-declaration namespace">theme</span><span class="token punctuation">;</span>

<span class="token keyword">use</span> <span class="token keyword">crate</span><span class="token module-declaration namespace"><span class="token punctuation">::</span>theme<span class="token punctuation">::</span></span><span class="token class-name">Theme</span><span class="token punctuation">;</span>
<span class="token keyword">use</span> <span class="token namespace">std<span class="token punctuation">::</span></span>fs<span class="token punctuation">;</span>
<span class="token keyword">use</span> <span class="token namespace">std<span class="token punctuation">::</span>fs<span class="token punctuation">::</span></span><span class="token class-name">File</span><span class="token punctuation">;</span>
<span class="token keyword">use</span> <span class="token namespace">std<span class="token punctuation">::</span>io<span class="token punctuation">::</span></span><span class="token class-name">Write</span><span class="token punctuation">;</span>
<span class="token keyword">use</span> <span class="token namespace">toml<span class="token punctuation">::</span></span><span class="token punctuation">{</span><span class="token class-name">Table</span><span class="token punctuation">,</span> <span class="token class-name">Value</span><span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token keyword">use</span> <span class="token namespace">tree_sitter_highlight<span class="token punctuation">::</span></span><span class="token punctuation">{</span><span class="token class-name">Highlight</span><span class="token punctuation">,</span> <span class="token class-name">HighlightConfiguration</span><span class="token punctuation">,</span> <span class="token class-name">Highlighter</span><span class="token punctuation">,</span> <span class="token class-name">HtmlRenderer</span><span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">fn</span> <span class="token function-definition function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">-&gt;</span> <span class="token class-name">Result</span><span class="token operator">&lt;</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token namespace">std<span class="token punctuation">::</span>io<span class="token punctuation">::</span></span><span class="token class-name">Error</span><span class="token operator">&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> config_str <span class="token operator">=</span> <span class="token namespace">fs<span class="token punctuation">::</span></span><span class="token function">read_to_string</span><span class="token punctuation">(</span><span class="token string">"monokai.toml"</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">expect</span><span class="token punctuation">(</span><span class="token string">"should be able to read"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">let</span> table <span class="token operator">=</span> config_str<span class="token punctuation">.</span><span class="token function">as_str</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">parse</span><span class="token punctuation">::</span><span class="token operator">&lt;</span><span class="token class-name">Table</span><span class="token operator">&gt;</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">unwrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">let</span> theme <span class="token operator">=</span> <span class="token class-name">Theme</span><span class="token punctuation">::</span><span class="token function">from</span><span class="token punctuation">(</span><span class="token class-name">Value</span><span class="token punctuation">::</span><span class="token class-name">Table</span><span class="token punctuation">(</span>table<span class="token punctuation">.</span><span class="token function">clone</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">let</span> attrs<span class="token punctuation">:</span> <span class="token class-name">Vec</span><span class="token operator">&lt;</span>_<span class="token operator">&gt;</span> <span class="token operator">=</span> theme
        <span class="token punctuation">.</span>highlights
        <span class="token punctuation">.</span><span class="token function">iter</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span><span class="token closure-params"><span class="token closure-punctuation punctuation">|</span>v<span class="token closure-punctuation punctuation">|</span></span> <span class="token macro property">format!</span><span class="token punctuation">(</span><span class="token string">"style=\"{}\""</span><span class="token punctuation">,</span> v<span class="token punctuation">.</span><span class="token function">to_string</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">collect</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">let</span> <span class="token keyword">mut</span> highlighter <span class="token operator">=</span> <span class="token class-name">Highlighter</span><span class="token punctuation">::</span><span class="token function">new</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">let</span> lang <span class="token operator">=</span> <span class="token namespace">tree_sitter_rust<span class="token punctuation">::</span></span><span class="token function">language</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">let</span> <span class="token keyword">mut</span> config <span class="token operator">=</span> <span class="token class-name">HighlightConfiguration</span><span class="token punctuation">::</span><span class="token function">new</span><span class="token punctuation">(</span>
        lang<span class="token punctuation">,</span>
        <span class="token string">"rust"</span><span class="token punctuation">,</span>
        <span class="token namespace">tree_sitter_rust<span class="token punctuation">::</span></span><span class="token constant">HIGHLIGHTS_QUERY</span><span class="token punctuation">,</span>
        <span class="token macro property">include_str!</span><span class="token punctuation">(</span><span class="token string">"../queries/rust/injections.scm"</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token macro property">include_str!</span><span class="token punctuation">(</span><span class="token string">"../queries/rust/locals.scm"</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">unwrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    config<span class="token punctuation">.</span><span class="token function">configure</span><span class="token punctuation">(</span>theme<span class="token punctuation">.</span><span class="token function">scopes</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">let</span> source <span class="token operator">=</span> <span class="token namespace">fs<span class="token punctuation">::</span></span><span class="token function">read_to_string</span><span class="token punctuation">(</span><span class="token string">"src/main.rs"</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">unwrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">let</span> src_bytes <span class="token operator">=</span> source<span class="token punctuation">.</span><span class="token function">as_bytes</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">let</span> highlights <span class="token operator">=</span> highlighter
        <span class="token punctuation">.</span><span class="token function">highlight</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>config<span class="token punctuation">,</span> src_bytes<span class="token punctuation">,</span> <span class="token class-name">None</span><span class="token punctuation">,</span> <span class="token closure-params"><span class="token closure-punctuation punctuation">|</span>_<span class="token closure-punctuation punctuation">|</span></span> <span class="token class-name">None</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">unwrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">let</span> <span class="token keyword">mut</span> renderer <span class="token operator">=</span> <span class="token class-name">HtmlRenderer</span><span class="token punctuation">::</span><span class="token function">new</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">let</span> _ <span class="token operator">=</span> renderer<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>highlights<span class="token punctuation">,</span> src_bytes<span class="token punctuation">,</span> <span class="token operator">&amp;</span><span class="token operator">|</span>h<span class="token punctuation">:</span> <span class="token class-name">Highlight</span><span class="token operator">|</span> attrs<span class="token punctuation">[</span>h<span class="token number">.0</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">as_bytes</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">let</span> <span class="token keyword">mut</span> file <span class="token operator">=</span> <span class="token class-name">File</span><span class="token punctuation">::</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token string">"out.html"</span><span class="token punctuation">)</span><span class="token operator">?</span><span class="token punctuation">;</span>
    file<span class="token punctuation">.</span><span class="token function">write_all</span><span class="token punctuation">(</span>
        <span class="token macro property">format!</span><span class="token punctuation">(</span>
            <span class="token string">"&lt;pre style=\"{} {}\"&gt;&lt;code&gt;"</span><span class="token punctuation">,</span>
            theme<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">"ui.background"</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">to_string</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
            theme<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">"ui.text"</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">to_string</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">as_bytes</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token punctuation">)</span><span class="token operator">?</span><span class="token punctuation">;</span>
    file<span class="token punctuation">.</span><span class="token function">write_all</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>renderer<span class="token punctuation">.</span>html<span class="token punctuation">)</span><span class="token operator">?</span><span class="token punctuation">;</span>
    file<span class="token punctuation">.</span><span class="token function">write_all</span><span class="token punctuation">(</span><span class="token string">b"&lt;/code&gt;&lt;/pre&gt;"</span><span class="token punctuation">)</span><span class="token operator">?</span><span class="token punctuation">;</span>
    <span class="token class-name">Ok</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre>

### Shiki

<pre style="background-color:#272822">
<span><pre class="shiki monokai vp-code" style="background-color:#272822;color:#F8F8F2" tabindex="0"><code><span class="line"><span style="color:#F92672">pub</span><span style="color:#66D9EF;font-style:italic"> mod</span><span style="color:#F8F8F2"> graphics;</span></span>
<span class="line"><span style="color:#F92672">pub</span><span style="color:#66D9EF;font-style:italic"> mod</span><span style="color:#F8F8F2"> theme;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F92672">use</span><span style="color:#F92672"> crate::</span><span style="color:#A6E22E;text-decoration:underline">theme</span><span style="color:#F92672">::</span><span style="color:#A6E22E;text-decoration:underline">Theme</span><span style="color:#F8F8F2">;</span></span>
<span class="line"><span style="color:#F92672">use</span><span> </span><span style="color:#A6E22E;text-decoration:underline">std</span><span style="color:#F92672">::</span><span style="color:#F8F8F2">fs;</span></span>
<span class="line"><span style="color:#F92672">use</span><span> </span><span style="color:#A6E22E;text-decoration:underline">std</span><span style="color:#F92672">::</span><span style="color:#A6E22E;text-decoration:underline">fs</span><span style="color:#F92672">::</span><span style="color:#A6E22E;text-decoration:underline">File</span><span style="color:#F8F8F2">;</span></span>
<span class="line"><span style="color:#F92672">use</span><span> </span><span style="color:#A6E22E;text-decoration:underline">std</span><span style="color:#F92672">::</span><span style="color:#A6E22E;text-decoration:underline">io</span><span style="color:#F92672">::</span><span style="color:#A6E22E;text-decoration:underline">Write</span><span style="color:#F8F8F2">;</span></span>
<span class="line"><span style="color:#F92672">use</span><span> </span><span style="color:#A6E22E;text-decoration:underline">toml</span><span style="color:#F92672">::</span><span style="color:#F8F8F2">{</span><span style="color:#A6E22E;text-decoration:underline">Table</span><span style="color:#F8F8F2">, </span><span style="color:#A6E22E;text-decoration:underline">Value</span><span style="color:#F8F8F2">};</span></span>
<span class="line"><span style="color:#F92672">use</span><span> </span><span style="color:#A6E22E;text-decoration:underline">tree_sitter_highlight</span><span style="color:#F92672">::</span><span style="color:#F8F8F2">{</span><span style="color:#A6E22E;text-decoration:underline">Highlight</span><span style="color:#F8F8F2">, </span><span style="color:#A6E22E;text-decoration:underline">HighlightConfiguration</span><span style="color:#F8F8F2">, </span><span style="color:#A6E22E;text-decoration:underline">Highlighter</span><span style="color:#F8F8F2">, </span><span style="color:#A6E22E;text-decoration:underline">HtmlRenderer</span><span style="color:#F8F8F2">};</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F92672">fn</span><span style="color:#A6E22E"> main</span><span style="color:#F8F8F2">() </span><span style="color:#F92672">-&gt;</span><span> </span><span style="color:#A6E22E;text-decoration:underline">Result</span><span style="color:#F8F8F2">&lt;(), std</span><span style="color:#F92672">::</span><span style="color:#F8F8F2">io</span><span style="color:#F92672">::</span><span style="color:#A6E22E;text-decoration:underline">Error</span><span style="color:#F8F8F2">&gt; {</span></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F8F8F2"> config_str </span><span style="color:#F92672">=</span><span> </span><span style="color:#A6E22E;text-decoration:underline">fs</span><span style="color:#F92672">::</span><span style="color:#A6E22E">read_to_string</span><span style="color:#F8F8F2">(</span><span style="color:#E6DB74">"catppuccin_mocha.toml"</span><span style="color:#F8F8F2">)</span><span style="color:#F92672">.</span><span style="color:#A6E22E">expect</span><span style="color:#F8F8F2">(</span><span style="color:#E6DB74">"should be able to read"</span><span style="color:#F8F8F2">);</span></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F8F8F2"> table </span><span style="color:#F92672">=</span><span style="color:#F8F8F2"> config_str</span><span style="color:#F92672">.</span><span style="color:#A6E22E">as_str</span><span style="color:#F8F8F2">()</span><span style="color:#F92672">.</span><span style="color:#A6E22E">parse</span><span style="color:#F92672">::</span><span style="color:#F8F8F2">&lt;</span><span style="color:#A6E22E;text-decoration:underline">Table</span><span style="color:#F8F8F2">&gt;()</span><span style="color:#F92672">.</span><span style="color:#A6E22E">unwrap</span><span style="color:#F8F8F2">();</span></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F8F8F2"> theme </span><span style="color:#F92672">=</span><span> </span><span style="color:#A6E22E;text-decoration:underline">Theme</span><span style="color:#F92672">::</span><span style="color:#A6E22E">from</span><span style="color:#F8F8F2">(</span><span style="color:#A6E22E;text-decoration:underline">Value</span><span style="color:#F92672">::</span><span style="color:#A6E22E">Table</span><span style="color:#F8F8F2">(table</span><span style="color:#F92672">.</span><span style="color:#A6E22E">clone</span><span style="color:#F8F8F2">()));</span></span>
<span class="line"></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F8F8F2"> attrs</span><span style="color:#F92672">:</span><span> </span><span style="color:#A6E22E;text-decoration:underline">Vec</span><span style="color:#F8F8F2">&lt;_&gt; </span><span style="color:#F92672">=</span><span style="color:#F8F8F2"> theme</span></span>
<span class="line"><span style="color:#F92672">        .</span><span style="color:#F8F8F2">highlights</span></span>
<span class="line"><span style="color:#F92672">        .</span><span style="color:#A6E22E">iter</span><span style="color:#F8F8F2">()</span></span>
<span class="line"><span style="color:#F92672">        .</span><span style="color:#A6E22E">map</span><span style="color:#F8F8F2">(</span><span style="color:#F92672">|</span><span style="color:#F8F8F2">v</span><span style="color:#F92672">|</span><span style="color:#A6E22E"> format!</span><span style="color:#F8F8F2">(</span><span style="color:#E6DB74">"style=</span><span style="color:#AE81FF">\"</span><span style="color:#E6DB74">{}</span><span style="color:#AE81FF">\"</span><span style="color:#E6DB74">"</span><span style="color:#F8F8F2">, v</span><span style="color:#F92672">.</span><span style="color:#A6E22E">to_string</span><span style="color:#F8F8F2">()))</span></span>
<span class="line"><span style="color:#F92672">        .</span><span style="color:#A6E22E">collect</span><span style="color:#F8F8F2">();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F92672"> mut</span><span style="color:#F8F8F2"> highlighter </span><span style="color:#F92672">=</span><span> </span><span style="color:#A6E22E;text-decoration:underline">Highlighter</span><span style="color:#F92672">::</span><span style="color:#A6E22E">new</span><span style="color:#F8F8F2">();</span></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F8F8F2"> lang </span><span style="color:#F92672">=</span><span> </span><span style="color:#A6E22E;text-decoration:underline">tree_sitter_rust</span><span style="color:#F92672">::</span><span style="color:#A6E22E">language</span><span style="color:#F8F8F2">();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F92672"> mut</span><span style="color:#F8F8F2"> config </span><span style="color:#F92672">=</span><span> </span><span style="color:#A6E22E;text-decoration:underline">HighlightConfiguration</span><span style="color:#F92672">::</span><span style="color:#A6E22E">new</span><span style="color:#F8F8F2">(</span></span>
<span class="line"><span style="color:#F8F8F2">        lang,</span></span>
<span class="line"><span style="color:#E6DB74">        "rust"</span><span style="color:#F8F8F2">,</span></span>
<span class="line"><span>        </span><span style="color:#A6E22E;text-decoration:underline">tree_sitter_rust</span><span style="color:#F92672">::</span><span style="color:#AE81FF">HIGHLIGHTS_QUERY</span><span style="color:#F8F8F2">,</span></span>
<span class="line"><span style="color:#A6E22E">        include_str!</span><span style="color:#F8F8F2">(</span><span style="color:#E6DB74">"../queries/rust/injections.scm"</span><span style="color:#F8F8F2">),</span></span>
<span class="line"><span style="color:#A6E22E">        include_str!</span><span style="color:#F8F8F2">(</span><span style="color:#E6DB74">"../queries/rust/locals.scm"</span><span style="color:#F8F8F2">),</span></span>
<span class="line"><span style="color:#F8F8F2">    )</span></span>
<span class="line"><span style="color:#F92672">    .</span><span style="color:#A6E22E">unwrap</span><span style="color:#F8F8F2">();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F8F8F2">    config</span><span style="color:#F92672">.</span><span style="color:#A6E22E">configure</span><span style="color:#F8F8F2">(theme</span><span style="color:#F92672">.</span><span style="color:#A6E22E">scopes</span><span style="color:#F8F8F2">());</span></span>
<span class="line"></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F8F8F2"> source </span><span style="color:#F92672">=</span><span> </span><span style="color:#A6E22E;text-decoration:underline">fs</span><span style="color:#F92672">::</span><span style="color:#A6E22E">read_to_string</span><span style="color:#F8F8F2">(</span><span style="color:#E6DB74">"src/main.rs"</span><span style="color:#F8F8F2">)</span><span style="color:#F92672">.</span><span style="color:#A6E22E">unwrap</span><span style="color:#F8F8F2">();</span></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F8F8F2"> src_bytes </span><span style="color:#F92672">=</span><span style="color:#F8F8F2"> source</span><span style="color:#F92672">.</span><span style="color:#A6E22E">as_bytes</span><span style="color:#F8F8F2">();</span></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F8F8F2"> highlights </span><span style="color:#F92672">=</span><span style="color:#F8F8F2"> highlighter</span></span>
<span class="line"><span style="color:#F92672">        .</span><span style="color:#A6E22E">highlight</span><span style="color:#F8F8F2">(</span><span style="color:#F92672">&amp;</span><span style="color:#F8F8F2">config, src_bytes, </span><span style="color:#A6E22E;text-decoration:underline">None</span><span style="color:#F8F8F2">, </span><span style="color:#F92672">|</span><span style="color:#F8F8F2">_</span><span style="color:#F92672">|</span><span> </span><span style="color:#A6E22E;text-decoration:underline">None</span><span style="color:#F8F8F2">)</span></span>
<span class="line"><span style="color:#F92672">        .</span><span style="color:#A6E22E">unwrap</span><span style="color:#F8F8F2">();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F92672"> mut</span><span style="color:#F8F8F2"> renderer </span><span style="color:#F92672">=</span><span> </span><span style="color:#A6E22E;text-decoration:underline">HtmlRenderer</span><span style="color:#F92672">::</span><span style="color:#A6E22E">new</span><span style="color:#F8F8F2">();</span></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F8F8F2"> _ </span><span style="color:#F92672">=</span><span style="color:#F8F8F2"> renderer</span><span style="color:#F92672">.</span><span style="color:#A6E22E">render</span><span style="color:#F8F8F2">(highlights, src_bytes, </span><span style="color:#F92672">&amp;|</span><span style="color:#F8F8F2">h</span><span style="color:#F92672">:</span><span> </span><span style="color:#A6E22E;text-decoration:underline">Highlight</span><span style="color:#F92672">|</span><span style="color:#F8F8F2"> attrs[h</span><span style="color:#F92672">.</span><span style="color:#AE81FF">0</span><span style="color:#F8F8F2">]</span><span style="color:#F92672">.</span><span style="color:#A6E22E">as_bytes</span><span style="color:#F8F8F2">());</span></span>
<span class="line"></span>
<span class="line"><span style="color:#66D9EF;font-style:italic">    let</span><span style="color:#F92672"> mut</span><span style="color:#F8F8F2"> file </span><span style="color:#F92672">=</span><span> </span><span style="color:#A6E22E;text-decoration:underline">File</span><span style="color:#F92672">::</span><span style="color:#A6E22E">create</span><span style="color:#F8F8F2">(</span><span style="color:#E6DB74">"out.html"</span><span style="color:#F8F8F2">)</span><span style="color:#F92672">?</span><span style="color:#F8F8F2">;</span></span>
<span class="line"><span style="color:#F8F8F2">    file</span><span style="color:#F92672">.</span><span style="color:#A6E22E">write_all</span><span style="color:#F8F8F2">(</span></span>
<span class="line"><span style="color:#A6E22E">        format!</span><span style="color:#F8F8F2">(</span></span>
<span class="line"><span style="color:#E6DB74">            "&lt;pre style=</span><span style="color:#AE81FF">\"</span><span style="color:#E6DB74">{} {}</span><span style="color:#AE81FF">\"</span><span style="color:#E6DB74">&gt;&lt;code&gt;"</span><span style="color:#F8F8F2">,</span></span>
<span class="line"><span style="color:#F8F8F2">            theme</span><span style="color:#F92672">.</span><span style="color:#A6E22E">get</span><span style="color:#F8F8F2">(</span><span style="color:#E6DB74">"ui.background"</span><span style="color:#F8F8F2">)</span><span style="color:#F92672">.</span><span style="color:#A6E22E">to_string</span><span style="color:#F8F8F2">(),</span></span>
<span class="line"><span style="color:#F8F8F2">            theme</span><span style="color:#F92672">.</span><span style="color:#A6E22E">get</span><span style="color:#F8F8F2">(</span><span style="color:#E6DB74">"ui.text"</span><span style="color:#F8F8F2">)</span><span style="color:#F92672">.</span><span style="color:#A6E22E">to_string</span><span style="color:#F8F8F2">()</span></span>
<span class="line"><span style="color:#F8F8F2">        )</span></span>
<span class="line"><span style="color:#F92672">        .</span><span style="color:#A6E22E">as_bytes</span><span style="color:#F8F8F2">(),</span></span>
<span class="line"><span style="color:#F8F8F2">    )</span><span style="color:#F92672">?</span><span style="color:#F8F8F2">;</span></span>
<span class="line"><span style="color:#F8F8F2">    file</span><span style="color:#F92672">.</span><span style="color:#A6E22E">write_all</span><span style="color:#F8F8F2">(</span><span style="color:#F92672">&amp;</span><span style="color:#F8F8F2">renderer</span><span style="color:#F92672">.</span><span style="color:#F8F8F2">html)</span><span style="color:#F92672">?</span><span style="color:#F8F8F2">;</span></span>
<span class="line"><span style="color:#F8F8F2">    file</span><span style="color:#F92672">.</span><span style="color:#A6E22E">write_all</span><span style="color:#F8F8F2">(</span><span style="color:#E6DB74">b"&lt;/code&gt;&lt;/pre&gt;"</span><span style="color:#F8F8F2">)</span><span style="color:#F92672">?</span><span style="color:#F8F8F2">;</span></span>
<span class="line"><span>    </span><span style="color:#A6E22E;text-decoration:underline">Ok</span><span style="color:#F8F8F2">(())</span></span>
<span class="line"><span style="color:#F8F8F2">}</span></span>
</code></pre></span></pre>

## Conclusion

Shiki does the job so well that it's absolutely overkill.
