import { isToday, isYesterday, format } from "date-fns";
function getDateLabel(dateInput) {
  const date = new Date(dateInput);

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  return format(date, "EEE, d MMM yyyy");
}
export default getDateLabel;
