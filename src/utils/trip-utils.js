import dayjs from 'dayjs';
import he from 'he';
import { MAX_ROUTE_DESTINATIONS } from '../const.js';

const SEPARATOR = ' — ';
const ELLIPSIS = '...';
const DATE_FORMAT_MONTH_DAY = 'MMM D';
const DATE_FORMAT_DAY = 'D';

export const formatRoute = (points, destinations) => {
  const uniqueDestinations = [...new Set(points.map((point) => {
    const destination = destinations.find((dest) => dest.id === point.destination);
    return destination ? he.encode(destination.name) : '';
  }).filter(Boolean))];

  if (uniqueDestinations.length === 0) {
    return '';
  }

  if (uniqueDestinations.length <= MAX_ROUTE_DESTINATIONS) {
    return uniqueDestinations.join(SEPARATOR);
  }

  const firstCity = uniqueDestinations[0];
  const lastCity = uniqueDestinations[uniqueDestinations.length - 1];
  return `${firstCity} ${SEPARATOR} ${ELLIPSIS} ${SEPARATOR} ${lastCity}`;
};

export const formatDates = (points) => {
  if (points.length === 0) {
    return '';
  }

  const sortedPoints = [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
  const startDate = dayjs(sortedPoints[0].dateFrom);
  const endDate = dayjs(sortedPoints[sortedPoints.length - 1].dateEnd);

  const startFormat = startDate.format(DATE_FORMAT_MONTH_DAY).toUpperCase();
  const endFormat = endDate.format(DATE_FORMAT_MONTH_DAY).toUpperCase();

  if (startDate.isSame(endDate, 'month')) {
    const startDayMonth = startDate.format(DATE_FORMAT_MONTH_DAY);
    const endDay = endDate.format(DATE_FORMAT_DAY);
    return `${startDayMonth} ${SEPARATOR} ${endDay}`.toUpperCase();
  }

  return `${startFormat} ${SEPARATOR} ${endFormat}`;
};

export const calculateTotalPrice = (points, offersModel) => {
  let total = 0;

  points.forEach((point) => {
    total += point.basePrice;

    const pointOffers = point.offers || [];
    pointOffers.forEach((offer) => {
      const allOffers = offersModel.getOffersByType(point.type);
      const offerData = allOffers.find((offerItem) => offerItem.id === offer.id);
      if (offerData) {
        total += offerData.price;
      }
    });
  });

  return total;
};
