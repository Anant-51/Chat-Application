import blueTick from "../assets/double-green-tick.png";
import doubleTick from "../assets/double-tick-icon.png";
import singleTick from "../assets/single-tick-icon.png";

const MessageStatusIcon = ({ status }) => {
  const statusIconClass = "w-4 h-4 opacity-80 object-contain ml-1";

  switch (status) {
    case "sent":
      return (
        <img src={singleTick} alt="singletick" className={statusIconClass} />
      );
    case "delievered":
      return (
        <img src={doubleTick} alt="doubltick" className={statusIconClass} />
      );

    case "seen":
      return (
        <div className="ml-1 bg-white">
          <img src={blueTick} alt="bluetick" className={statusIconClass} />
        </div>
      );
    default:
      return null;
  }
};

export default MessageStatusIcon;
