import Observable from '../framework/observable.js';
import { FilterType } from '../const.js';

export default class FilterModel extends Observable {
  #currentFilter = FilterType.EVERYTHING;

  getFilter() {
    return this.#currentFilter;
  }

  setFilter(filterType) {
    this.#currentFilter = filterType;
    this._notify();
  }
}
