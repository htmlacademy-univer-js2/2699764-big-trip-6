import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);

export const formatShortDate = (date) => {
  if (!date) {
    return '';
  }
  const month = dayjs(date).format('MMM');
  const day = dayjs(date).format('DD');
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${day}`;
};

export const formatTime = (date) => date ? dayjs(date).format('HH:mm') : '';

export const formatDuration = (dateFrom, dateEnd) => {
  if (!dateFrom || !dateEnd) {
    return '';
  }

  const diff = dayjs(dateEnd).diff(dayjs(dateFrom));
  const durationObj = dayjs.duration(diff);

  const days = Math.floor(durationObj.asDays());
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();

  if (days > 0) {
    return `${days.toString().padStart(2, '0')}D ${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
  }
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
  }
  return `${minutes}M`;
};

export const formatDate = (date, format = 'DD/MM/YY HH:mm') => dayjs(date).format(format);

export const isDateEqual = (dateA, dateB) => dayjs(dateA).isSame(dateB, 'minute');

export const humanizeTripDate = (date) => {
  if (!date) {
    return '';
  }
  return dayjs(date).format('DD MMM').toUpperCase();
};
