import { render, replace, remove } from '../framework/render.js';
import RoutePoint from '../view/route-point-view.js';
import EditForm from '../view/edit-form-view.js';
import { UserAction } from '../const.js';
import { isEscapeKey } from '../utils/common-utils.js';

const DisplayMode = {
  VIEW: 'VIEW',
  EDIT: 'EDIT',
};

export default class PointPresenter {
  #container = null;
  #pointsModel = null;
  #onDataChange = null;
  #onModeChange = null;

  #viewComponent = null;
  #editComponent = null;

  #currentPoint = null;
  #currentMode = DisplayMode.VIEW;

  constructor({ container, pointsModel, onDataChange, onModeChange }) {
    this.#container = container;
    this.#pointsModel = pointsModel;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
  }

  init(point) {
    this.#currentPoint = point;

    const prevView = this.#viewComponent;
    const prevEdit = this.#editComponent;

    const destination = this.#pointsModel.getDestinationById(this.#currentPoint.destination);
    const pointOffers = this.#currentPoint.offers
      .map((id) => this.#pointsModel.getOfferById(this.#currentPoint.type, id))
      .filter(Boolean);

    this.#viewComponent = new RoutePoint({
      point: this.#currentPoint,
      destination,
      offers: pointOffers,
      onRollupClick: () => this.#openEdit(),
      onFavoriteClick: () => this.#toggleFavorite(),
    });

    if (this.#viewComponent && this.#viewComponent.element) {
      this.#viewComponent.setHandlers();
    }

    this.#editComponent = new EditForm({
      point: this.#currentPoint,
      destinations: this.#pointsModel.getDestinations(),
      allOffers: this.#pointsModel.getOffers(),
      isNew: false,
      onFormSubmit: (updatedPoint) => this.#save(updatedPoint),
      onCloseClick: () => this.#closeEdit(),
      onDeleteClick: (pointToDelete) => this.#delete(pointToDelete),
    });

    if (!prevView || !prevEdit) {
      render(this.#viewComponent, this.#container);
      return;
    }

    if (this.#currentMode === DisplayMode.VIEW) {
      replace(this.#viewComponent, prevView);
    }
    if (this.#currentMode === DisplayMode.EDIT) {
      replace(this.#editComponent, prevEdit);
    }

    remove(prevView);
    remove(prevEdit);
  }

  destroy() {
    if (this.#viewComponent) {
      remove(this.#viewComponent);
    }
    if (this.#editComponent) {
      remove(this.#editComponent);
    }
  }

  resetView() {
    if (this.#currentMode === DisplayMode.EDIT) {
      this.#closeEdit();
    }
  }

  #openEdit = () => {
    requestAnimationFrame(() => {
      replace(this.#editComponent, this.#viewComponent);
      document.addEventListener('keydown', this.#onEsc);
      this.#onModeChange?.();
      this.#currentMode = DisplayMode.EDIT;
    });
  };

  #closeEdit = () => {
    requestAnimationFrame(() => {
      replace(this.#viewComponent, this.#editComponent);
      document.removeEventListener('keydown', this.#onEsc);
      this.#editComponent = new EditForm({
        point: this.#currentPoint,
        destinations: this.#pointsModel.getDestinations(),
        allOffers: this.#pointsModel.getOffers(),
        isNew: false,
        onFormSubmit: (updatedPoint) => this.#save(updatedPoint),
        onCloseClick: () => this.#closeEdit(),
        onDeleteClick: (pointToDelete) => this.#delete(pointToDelete),
      });
      this.#currentMode = DisplayMode.VIEW;
    });
  };

  #onEsc = (event) => {
    if (isEscapeKey(event)) {
      event.preventDefault();
      this.#closeEdit();
    }
  };

  #toggleFavorite = async () => {
    try {
      await this.#onDataChange?.(
        UserAction.UPDATE_EVENT,
        { ...this.#currentPoint, isFavorite: !this.#currentPoint.isFavorite }
      );
    } catch {
      if (this.#viewComponent) {
        this.#viewComponent.shake();
      }
    }
  };

  #save = async (updatedPoint) => {
    if (this.#editComponent) {
      this.#editComponent.setSavingState();
    }
    try {
      await this.#onDataChange?.(UserAction.UPDATE_EVENT, updatedPoint);
      this.#closeEdit();
    } catch {
      if (this.#editComponent) {
        this.#editComponent.shake(() => this.#editComponent.setDefaultState());
      }
    }
  };

  #delete = async (pointToDelete) => {
    if (this.#editComponent) {
      this.#editComponent.setDeletingState();
    }
    try {
      await this.#onDataChange?.(UserAction.DELETE_EVENT, pointToDelete);
    } catch {
      if (this.#editComponent) {
        this.#editComponent.shake(() => this.#editComponent.setDefaultState());
      }
    }
  };
}
