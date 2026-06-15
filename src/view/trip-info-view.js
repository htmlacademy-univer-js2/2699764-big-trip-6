import AbstractView from '../framework/view/abstract-view.js';
import { humanizeTripDate } from '../utils/date-utils.js';
import he from 'he';

export default class TripInfoView extends AbstractView {
  #route = '';
  #startDate = null;
  #endDate = null;
  #totalCost = 0;

  constructor({ route, startDate, endDate, totalCost } = {}) {
    super();
    this.#route = route || '';
    this.#startDate = startDate || null;
    this.#endDate = endDate || null;
    this.#totalCost = totalCost || 0;
  }

  get template() {
    return `
      <section class="trip-main__trip-info trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">${he.encode(this.#route)}</h1>
          <p class="trip-info__dates">${this.#formatDates()}</p>
        </div>
        <p class="trip-info__cost">
          Total: &euro;&nbsp;<span class="trip-info__cost-value">${this.#totalCost}</span>
        </p>
      </section>
    `;
  }

  #formatDates() {
    if (!this.#startDate || !this.#endDate) {
      return '';
    }
    return `${humanizeTripDate(this.#startDate)} — ${humanizeTripDate(this.#endDate)}`;
  }
}
