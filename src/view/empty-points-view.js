import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';
import he from 'he';

const EMPTY_MESSAGES = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.FUTURE]: 'There are no future events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.PAST]: 'There are no past events now',
};

const createEmptyListTemplate = (filterType) => {
  const message = EMPTY_MESSAGES[filterType] || EMPTY_MESSAGES[FilterType.EVERYTHING];
  return `<p class="trip-events__msg">${he.encode(message)}</p>`;
};

export default class EmptyListView extends AbstractView {
  #currentFilter = null;

  constructor(filterType) {
    super();
    this.#currentFilter = filterType;
  }

  get template() {
    return createEmptyListTemplate(this.#currentFilter);
  }
}
