import AbstractView from '../framework/view/abstract-view.js';
import { formatShortDate, formatTime, formatDuration } from '../utils/date-utils.js';
import he from 'he';

export default class RoutePoint extends AbstractView {
  #point = null;
  #destination = null;
  #offers = [];
  #onRollupClick = null;
  #onFavoriteClick = null;

  constructor({ point, destination, offers, onRollupClick, onFavoriteClick }) {
    super();
    this.#point = point;
    this.#destination = destination;
    this.#offers = offers || [];
    this.#onRollupClick = onRollupClick;
    this.#onFavoriteClick = onFavoriteClick;
  }

  get template() {
    if (!this.#point) {
      return '<li class="trip-events__item">Ошибка загрузки точки</li>';
    }
    return this.#createRoutePointTemplate();
  }

  #createRoutePointTemplate() {
    const { type, dateFrom, dateEnd, basePrice, isFavorite } = this.#point;
    const destinationName = this.#destination ? this.#destination.name : '';

    const date = formatShortDate(dateFrom);
    const startTimeStr = formatTime(dateFrom);
    const endTimeStr = formatTime(dateEnd);
    const durationStr = formatDuration(dateFrom, dateEnd);

    const offersTemplate = this.#offers.length > 0 ? `
      <ul class="event__selected-offers">
        ${this.#offers.map((offer) => `
          <li class="event__offer">
            <span class="event__offer-title">${he.encode(offer.title)}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </li>
        `).join('')}
      </ul>
    ` : '';

    const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';
    const formattedType = type ? he.encode(type.charAt(0).toUpperCase() + type.slice(1)) : '';

    return `<li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${dateFrom}">${date}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type || 'flight'}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${formattedType} ${he.encode(destinationName)}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${dateFrom}">${startTimeStr}</time>
            &mdash;
            <time class="event__end-time" datetime="${dateEnd}">${endTimeStr}</time>
          </p>
          <p class="event__duration">${durationStr}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        ${offersTemplate}
        <button class="event__favorite-btn ${favoriteClass}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>`;
  }

  setHandlers() {
    const rollupBtn = this.element.querySelector('.event__rollup-btn');
    const favoriteBtn = this.element.querySelector('.event__favorite-btn');

    if (rollupBtn) {
      rollupBtn.addEventListener('click', this.#rollupClickHandler);
    }
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', this.#favoriteClickHandler);
    }
  }

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#onRollupClick?.();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#onFavoriteClick?.();
  };
}
