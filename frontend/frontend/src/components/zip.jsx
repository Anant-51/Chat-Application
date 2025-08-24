import FileMessageBase from './docandzipbase.jsx';
import zipIcon from './icons/zip.svg'; // Use a proper path or URL

export default function ZipMessage(props) {
  return <FileMessageBase {...props} icon={zipIcon} />;
}
