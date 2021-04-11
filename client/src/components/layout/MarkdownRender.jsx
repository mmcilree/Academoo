import ReactMarkdown from 'react-markdown';
import MathJax from 'react-mathjax2';
import RemarkMathPlugin from 'remark-math';

const gfm = require('remark-gfm');

/* MarkdownRender component usese React Markdown library and Math Jax with React MathJax Plugin
    Supports normal markdown syntax and mathjax in posts.  */
function MarkdownRender(props) {
    const newProps = {
        ...props,
        plugins: [
            RemarkMathPlugin,
            gfm,
        ],
        renderers: {
            ...props.renderers,
            math: (props) =>
                <MathJax.Node>{props.value}</MathJax.Node>,
            inlineMath: (props) =>
                <MathJax.Node inline>{props.value}</MathJax.Node>
        }
    };
    return (
        <MathJax.Context input="tex">
            <ReactMarkdown {...newProps} />
        </MathJax.Context>
    );
}

export default MarkdownRender