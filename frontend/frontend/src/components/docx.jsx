import FileMessageBase from './docandzipbase.jsx';
import docxIcon from './icons/docx.svg'; // Use a proper path or URL

export default function DocxMessage(props) {
  return <FileMessageBase {...props} icon={docxIcon} />;
}
