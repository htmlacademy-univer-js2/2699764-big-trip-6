import { render } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';

export default class FilterPresenter {
  #container = null;
  #filterModel = null;
  #pointsModel = null;
  #onFilterChange = null;
  #onSortReset = null;

  #filterComponent = null;

  constructor({ filterContainer, filterModel, pointsModel, onFilterChange, onSortReset }) {
    this.#container = filterContainer;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
    this.#onFilterChange = onFilterChange;
    this.#onSortReset = onSortReset;

    this.#filterModel.addObserver(this.#onModelUpdate);
  }

  init() {
    const currentFilter = this.#filterModel.getFilter();
    this.#filterComponent = new FiltersView(currentFilter, this.#onFilterSelect);
    render(this.#filterComponent, this.#container);
  }

  #onFilterSelect = (filterType) => {
    if (this.#filterModel.getFilter() === filterType) {
      return;
    }
    this.#filterModel.setFilter(filterType);
    this.#onSortReset?.();
    this.#onFilterChange?.();
  };

  #onModelUpdate = () => {
    this.#filterComponent.updateFilter(this.#filterModel.getFilter());
  };

  setFilterDisabled(filterType, isDisabled) {
    this.#filterComponent.setDisabled(filterType, isDisabled);
  }
}
