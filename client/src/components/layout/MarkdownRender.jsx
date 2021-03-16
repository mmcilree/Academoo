import ReactMarkdown from 'react-markdown';
import MathJax from 'react-mathjax';
import RemarkMathPlugin from 'remark-math';

const gfm = require('remark-gfm');
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
                <MathJax.Node formula={props.value} />,
            inlineMath: (props) =>
                <MathJax.Node inline formula={props.value} />
        }
    };
    return (
        <MathJax.Provider input="tex">
            <ReactMarkdown {...newProps} />
        </MathJax.Provider>
    );
}

export default MarkdownRender