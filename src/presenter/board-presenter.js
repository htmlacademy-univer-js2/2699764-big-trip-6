import { render, remove } from '../framework/render.js';
import SortView from '../view/sorting-view.js';
import EmptyListView from '../view/empty-points-view.js';
import LoadingView from '../view/loading-view.js';
import ErrorView from '../view/error-view.js';
import FilterPresenter from './filter-presenter.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import { FilterType, SortType, UserAction, UpdateType } from '../const.js';
import TripInfoPresenter from './trip-presenter.js';

export default class BoardPresenter {
  #pointsModel = null;
  #filterModel = null;
  #pointsList = document.createElement('ul');
  #tripEventsContainer = null;

  #pointControllers = new Map();
  #newPointController = null;

  #filterController = null;
  #sortComponent = null;
  #emptyComponent = null;
  #loadingComponent = null;
  #errorComponent = null;
  #headerController = null;
  #addButton = null;

  #currentFilter = FilterType.EVERYTHING;
  #currentSort = SortType.DAY;
  #isLoading = true;
  #hasError = false;
  #isCreating = false;

  constructor({ pointsModel, filterModel }) {
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;

    this.#onFilterChange = this.#onFilterChange.bind(this);
    this.#onSortChange = this.#onSortChange.bind(this);
    this.#onModelUpdate = this.#onModelUpdate.bind(this);
    this.#onUserAction = this.#onUserAction.bind(this);
    this.#onAddClick = this.#onAddClick.bind(this);
  }

  #onModelUpdate = (updateType, data) => {
    if (updateType === UpdateType.INIT) {
      this.#isLoading = false;
      if (data?.isError) {
        this.#hasError = true;
        this.#showError();
        return;
      }
      this.#renderPoints();
      return;
    }
    this.#renderPoints();
  };

  #onFilterChange = () => {
    this.#currentFilter = this.#filterModel.getFilter();
    this.#currentSort = SortType.DAY;
    this.#renderPoints();
  };

  #onSortChange = (sortType) => {
    if (this.#currentSort === sortType) {
      return;
    }
    this.#currentSort = sortType;
    this.#renderPoints();
  };

  #onUserAction = async (actionType, data) => {
    const updateStrategy = UpdateType.MINOR;

    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        try {
          await this.#pointsModel.updatePoint(updateStrategy, data);
        } catch {
          throw new Error('Update failed');
        }
        break;
      case UserAction.ADD_EVENT:
        try {
          await this.#pointsModel.addPoint(updateStrategy, data);
        } catch {
          throw new Error('Add failed');
        }
        break;
      case UserAction.DELETE_EVENT:
        try {
          await this.#pointsModel.deletePoint(updateStrategy, data);
        } catch {
          throw new Error('Delete failed');
        }
        break;
    }
  };

  #onAddClick = () => {
    if (this.#isCreating) {
      return;
    }

    this.#filterModel.setFilter(FilterType.EVERYTHING);
    this.#currentSort = SortType.DAY;
    this.#pointControllers.forEach((c) => c.resetView());

    this.#isCreating = true;
    this.#addButton.disabled = true;
    this.#showNewPointForm();
  };

  #hideNewPointForm = () => {
    if (this.#newPointController) {
      this.#newPointController.destroy();
      this.#newPointController = null;
    }
    this.#isCreating = false;
    this.#addButton.disabled = false;
    this.#renderPoints();
  };

  #showNewPointForm = () => {
    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }

    this.#newPointController = new NewPointPresenter({
      container: this.#pointsList,
      pointsModel: this.#pointsModel,
      onClose: this.#hideNewPointForm,
      onSave: async (newPoint) => {
        await this.#onUserAction(UserAction.ADD_EVENT, newPoint);
        this.#hideNewPointForm();
      },
    });
    this.#newPointController.init();
  };

  #onModeChange = () => {
    if (this.#isCreating && this.#newPointController) {
      this.#newPointController.destroy();
      this.#newPointController = null;
      this.#isCreating = false;
      this.#addButton.disabled = false;
    }
    this.#pointControllers.forEach((c) => c.resetView());
  };

  #renderSinglePoint(point) {
    const controller = new PointPresenter({
      container: this.#pointsList,
      pointsModel: this.#pointsModel,
      onDataChange: this.#onUserAction,
      onModeChange: this.#onModeChange,
    });
    controller.init(point);
    this.#pointControllers.set(point.id, controller);
  }

  async init() {
    const filterContainer = document.querySelector('.trip-controls__filters');
    this.#addButton = document.querySelector('.trip-main__event-add-btn');
    this.#tripEventsContainer = document.querySelector('.trip-events');

    this.#pointsModel.addObserver(this.#onModelUpdate);
    this.#filterModel.addObserver(this.#onFilterChange);

    this.#filterController = new FilterPresenter({
      filterContainer: filterContainer,
      filterModel: this.#filterModel,
      pointsModel: this.#pointsModel,
      onFilterChange: this.#onFilterChange,
      onSortReset: () => {
        this.#currentSort = SortType.DAY;
      },
    });
    this.#filterController.init();

    const headerContainer = document.querySelector('.trip-main');
    this.#headerController = new TripInfoPresenter({
      container: headerContainer,
      pointsModel: this.#pointsModel,
    });
    this.#headerController.init();

    this.#addButton.addEventListener('click', this.#onAddClick);
    this.#pointsList.classList.add('trip-events__list');
    this.#tripEventsContainer.append(this.#pointsList);

    this.#showLoading();
  }

  #showLoading() {
    this.#clearAll();
    this.#loadingComponent = new LoadingView();
    render(this.#loadingComponent, this.#pointsList);
  }

  #showError() {
    this.#clearAll();
    this.#errorComponent = new ErrorView();
    render(this.#errorComponent, this.#pointsList);
  }

  #showEmpty() {
    this.#clearAll();
    this.#emptyComponent = new EmptyListView(this.#currentFilter);
    render(this.#emptyComponent, this.#pointsList);
  }

  #renderPoints() {
    this.#clearAll();

    const points = this.#getFilteredAndSorted();

    if (this.#sortComponent) {
      remove(this.#sortComponent);
    }
    this.#sortComponent = new SortView(this.#currentSort, this.#onSortChange);
    render(this.#sortComponent, this.#tripEventsContainer, 'afterbegin');

    if (points.length === 0 && !this.#isCreating) {
      this.#showEmpty();
      return;
    }

    points.forEach((point) => this.#renderSinglePoint(point));
  }

  #getFilteredAndSorted() {
    let points = this.#pointsModel.getPoints();
    points = this.#applyFilter(points);
    points = this.#applySort(points);
    return points;
  }

  #applyFilter(points) {
    const now = new Date();
    const filter = this.#filterModel.getFilter();

    switch (filter) {
      case FilterType.FUTURE:
        return points.filter((p) => new Date(p.dateFrom) > now);
      case FilterType.PRESENT:
        return points.filter((p) => {
          const start = new Date(p.dateFrom);
          const end = new Date(p.dateEnd);
          return start <= now && end >= now;
        });
      case FilterType.PAST:
        return points.filter((p) => new Date(p.dateEnd) < now);
      default:
        return points;
    }
  }

  #applySort(points) {
    switch (this.#currentSort) {
      case SortType.TIME:
        return points.sort((a, b) => {
          const durA = new Date(a.dateEnd) - new Date(a.dateFrom);
          const durB = new Date(b.dateEnd) - new Date(b.dateFrom);
          return durB - durA;
        });
      case SortType.PRICE:
        return points.sort((a, b) => b.basePrice - a.basePrice);
      default:
        return points.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    }
  }

  #clearAll() {
    this.#pointControllers.forEach((c) => c.destroy());
    this.#pointControllers.clear();
    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
    }
    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
    }
    if (this.#errorComponent) {
      remove(this.#errorComponent);
    }
  }
}
