import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  [{ align: [] }],
  ['clean'],
];

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'متن پست را اینجا بنویسید...',
  className = '',
  minHeight = '220px',
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: toolbarOptions,
      clipboard: { matchVisual: false },
    }),
    []
  );

  return (
    <div className={`rich-editor-wrap ${className}`} dir="rtl">
      <style>{`
        .rich-editor-wrap .ql-toolbar.ql-snow { border-color: rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); }
        .rich-editor-wrap .ql-container.ql-snow { border-color: rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); }
        .rich-editor-wrap .ql-editor { min-height: ${minHeight}; direction: rtl; text-align: right; color: #e5e7eb; }
        .rich-editor-wrap .ql-editor.ql-blank::before { color: rgba(255,255,255,0.4); right: 15px; left: auto; }
        .rich-editor-wrap .ql-snow .ql-stroke { stroke: rgba(255,255,255,0.25); }
        .rich-editor-wrap .ql-snow .ql-fill { fill: rgba(255,255,255,0.4); }
        .rich-editor-wrap .ql-snow .ql-picker { color: rgba(255,255,255,0.8); }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
      />
    </div>
  );
}
