import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/ru";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.locale("ru");

export const formatLastSeen = (date) => {
  if (!date) return "Был в сети давно";

  const lastSeen = dayjs(date);
  const now = dayjs();

  const diffInHours = now.diff(lastSeen, "hour");
  const diffInDays = now.diff(lastSeen, "day");

  if (diffInDays > 1) {
    return `Был(а) в сети ${lastSeen.format("D MMMM в HH:mm")}`;
  }

  if (diffInDays === 1) {
    return `Был(а) в сети вчера в ${lastSeen.format("HH:mm")}`;
  }

  if (diffInHours >= 1) {
    return `Был(а) в сети ${lastSeen.format("HH:mm")}`;
  }

  return `Был(а) в сети ${lastSeen.fromNow()}`;
};
