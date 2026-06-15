import { render, remove } from '../framework/render.js';
import EditForm from '../view/edit-form-view.js';
import { EventType } from '../const.js';
import { isEscapeKey } from '../utils/common-utils.js';

const ONE_HOUR_IN_MS = 3600000;

export default class NewPointPresenter {
  #container = null;
  #pointsModel = null;
  #onClose = null;
  #onSave = null;

  #newPointComponent = null;

  constructor({ container, pointsModel, onClose, onSave }) {
    this.#container = container;
    this.#pointsModel = pointsModel;
    this.#onClose = onClose;
    this.#onSave = onSave;
  }

  init() {
    if (this.#newPointComponent !== null) {
      return;
    }

    const newPoint = {
      type: EventType.FLIGHT,
      destination: '',
      dateFrom: new Date().toISOString(),
      dateEnd: new Date(Date.now() + ONE_HOUR_IN_MS).toISOString(),
      basePrice: 0,
      offers: [],
      isFavorite: false,
    };

    this.#newPointComponent = new EditForm({
      point: newPoint,
      destinations: this.#pointsModel.getDestinations(),
      allOffers: this.#pointsModel.getOffers(),
      isNew: true
    });

    this.#newPointComponent.setFormSubmitHandler(async () => {
      await this.#saveHandler();
    });

    this.#newPointComponent.setRollupClickHandler(() => {
      this.#cancelHandler();
    });

    this.#newPointComponent.setDeleteClickHandler(() => {
      this.#cancelHandler();
    });

    render(this.#newPointComponent, this.#container, 'afterbegin');
    document.addEventListener('keydown', this.#escKeydownHandler);
  }

  destroy() {
    if (this.#newPointComponent === null) {
      return;
    }

    remove(this.#newPointComponent);
    this.#newPointComponent = null;

    document.removeEventListener('keydown', this.#escKeydownHandler);
  }

  #escKeydownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#cancelHandler();
    }
  };

  #cancelHandler = () => {
    this.destroy();
    this.#onClose?.();
  };

  #saveHandler = async () => {
    const formData = this.#newPointComponent.getData();
    this.#newPointComponent.setSavingState();
    try {
      await this.#onSave(formData);
      this.destroy();
    } catch (err) {
      this.#newPointComponent.shake();
      this.#newPointComponent.setDefaultState();
    }
  };
}
