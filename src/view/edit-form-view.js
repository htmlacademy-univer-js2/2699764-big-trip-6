import StatefulComponent from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import he from 'he';
import { EventType } from '../const.js';

const SHAKE_TIMEOUT = 500;
const ALL_EVENT_TYPES = Object.values(EventType);
const DEFAULT_HOURS_OFFSET = 1;
const MILLISECONDS_PER_HOUR = 3600000;
const DEFAULT_PRICE = 0;

const generateTypesHtml = (currentType, isDisabled) => ALL_EVENT_TYPES.map((eventType) => {
  const isChecked = currentType === eventType ? 'checked' : '';
  return `
      <div class="event__type-item">
        <input
          id="event-type-${eventType}-1"
          class="event__type-input visually-hidden"
          type="radio"
          name="event-type"
          value="${eventType}"
          ${isChecked}
          ${isDisabled ? 'disabled' : ''}
        >
        <label class="event__type-label event__type-label--${eventType}" for="event-type-${eventType}-1">
          ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}
        </label>
      </div>
    `;
}).join('');

const generateDestinationsHtml = (destinations) => destinations.map((destination) =>
  `<option value="${he.encode(destination.name)}"></option>`
).join('');

const generateOffersHtml = (offers, selectedOffers, isDisabled) => {
  const offersList = offers.map((offer) => {
    const isChecked = selectedOffers.includes(offer.id) ? 'checked' : '';
    return `
      <div class="event__offer-selector">
        <input
          class="event__offer-checkbox visually-hidden"
          id="event-offer-${offer.id}"
          type="checkbox"
          name="event-offer-${offer.id}"
          ${isChecked}
          data-offer-id="${offer.id}"
          ${isDisabled ? 'disabled' : ''}
        >
        <label class="event__offer-label" for="event-offer-${offer.id}">
          <span class="event__offer-title">${he.encode(offer.title)}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `;
  }).join('');

  return `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${offersList}
      </div>
    </section>
  `;
};

const generateDestinationHtml = (destinationData) => {
  if (!destinationData) {
    return '';
  }

  let picturesHtml = '';
  if (destinationData.pictures && destinationData.pictures.length > 0) {
    const picturesList = destinationData.pictures.map((picture) =>
      `<img class="event__photo" src="${he.encode(picture.src)}" alt="${he.encode(picture.description)}">`
    ).join('');
    picturesHtml = `
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${picturesList}
        </div>
      </div>
    `;
  }

  if (!destinationData.description && !picturesHtml) {
    return '';
  }

  return `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${he.encode(destinationData.description || '')}</p>
      ${picturesHtml}
    </section>
  `;
};

const createFormTemplate = (state, destinationsList, allOffersList) => {
  const { id, type, destination, dateFrom, dateEnd, basePrice, isDisabled, isSaving, isDeleting, offers } = state;

  const destinationData = destinationsList.find((item) => item.id === destination);
  const currentOffers = allOffersList.find((item) => item.type === type)?.offers || [];
  const selectedOffers = offers || [];

  const resetButtonText = id ? 'Delete' : 'Cancel';
  const finalResetText = isDeleting ? 'Deleting...' : resetButtonText;

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post" autocomplete="off">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox" ${isDisabled ? 'disabled' : ''}>
            <div class="event__type-list">
              <fieldset class="event__type-group" ${isDisabled ? 'disabled' : ''}>
                <legend class="visually-hidden">Event type</legend>
                ${generateTypesHtml(type, isDisabled)}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">${type}</label>
            <input
              class="event__input event__input--destination"
              id="event-destination-1"
              type="text"
              name="event-destination"
              value="${destinationData ? he.encode(destinationData.name) : ''}"
              list="destination-list-1"
              required
              ${isDisabled ? 'disabled' : ''}
            >
            <datalist id="destination-list-1">
              ${generateDestinationsHtml(destinationsList)}
            </datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input
              class="event__input event__input--time"
              id="event-start-time-1"
              type="text"
              name="event-start-time"
              value="${dateFrom}"
              ${isDisabled ? 'disabled' : ''}
            >
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input
              class="event__input event__input--time"
              id="event-end-time-1"
              type="text"
              name="event-end-time"
              value="${dateEnd}"
              ${isDisabled ? 'disabled' : ''}
            >
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>&euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-1"
              type="text"
              name="event-price"
              value="${basePrice}"
              required
              ${isDisabled ? 'disabled' : ''}
            >
          </div>
          <button class="event__save-btn btn btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>
            ${isSaving ? 'Saving...' : 'Save'}
          </button>
          <button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}>
            ${finalResetText}
          </button>
          <button class="event__rollup-btn" type="button" ${isDisabled ? 'disabled' : ''}>
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          ${currentOffers.length > 0 ? generateOffersHtml(currentOffers, selectedOffers, isDisabled) : ''}
          ${generateDestinationHtml(destinationData)}
        </section>
      </form>
    </li>
  `;
};

export default class EditForm extends StatefulComponent {
  _callback = {};

  #currentPoint = null;
  #cityList = [];
  #serviceList = {};
  #isCreateMode = false;
  #datePickerStart = null;
  #datePickerEnd = null;

  #onFormSend = null;
  #onClosePanel = null;
  #onItemDelete = null;

  constructor({ point, destinations, allOffers, isNew = false, onFormSubmit, onCloseClick, onDeleteClick }) {
    super();
    this._callback = {};
    this.#currentPoint = point;
    this.#cityList = destinations;
    this.#serviceList = allOffers;
    this.#isCreateMode = isNew;
    this.#onFormSend = onFormSubmit;
    this.#onClosePanel = onCloseClick;
    this.#onItemDelete = onDeleteClick;

    this._setState(EditForm.parseDataToState(point));
    this._restoreHandlers();
  }

  get template() {
    return createFormTemplate(this._state, this.#cityList, this.#serviceList);
  }

  setViewState(stateData) {
    if (stateData.isAborting) {
      const saveButton = this.element.querySelector('.event__save-btn');
      const resetButton = this.element.querySelector('.event__reset-btn');

      if (saveButton) {
        saveButton.textContent = 'Save';
      }
      if (resetButton) {
        resetButton.textContent = this._state.id ? 'Delete' : 'Cancel';
      }

      this.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
      return;
    }

    this.updateElement({
      isDisabled: true,
      isSaving: stateData.isSaving || false,
      isDeleting: stateData.isDeleting || false,
    });
  }

  shakeElement(callback) {
    const formElement = this.element.querySelector('.event--edit');
    if (!formElement) {
      super.shake(callback);
      return;
    }

    if (!document.getElementById('custom-shake-style')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'custom-shake-style';
      styleTag.textContent = `
        @keyframes customShakeEffect {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .forced-shake-animation {
          animation: customShakeEffect 0.6s ease-in-out !important;
        }
      `;
      document.head.appendChild(styleTag);
    }

    formElement.classList.add('forced-shake-animation');
    setTimeout(() => {
      formElement.classList.remove('forced-shake-animation');
      callback?.();
    }, SHAKE_TIMEOUT);
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    const form = this.element.querySelector('form');
    if (form) {
      form.addEventListener('submit', this.#handleSubmit);
    }
  }

  setRollupClickHandler(callback) {
    this._callback.rollupClick = callback;
    const rollupBtn = this.element.querySelector('.event__rollup-btn');
    if (rollupBtn) {
      rollupBtn.addEventListener('click', this.#handleClose);
    }
  }

  setDeleteClickHandler(callback) {
    this._callback.deleteClick = callback;
    const deleteBtn = this.element.querySelector('.event__reset-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', this.#handleReset);
    }
  }

  setSavingState() {
    const saveBtn = this.element.querySelector('.event__save-btn');
    if (saveBtn) {
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;
    }
    const deleteBtn = this.element.querySelector('.event__reset-btn');
    if (deleteBtn && deleteBtn.textContent === 'Delete') {
      deleteBtn.disabled = true;
    }
  }

  setDeletingState() {
    const deleteBtn = this.element.querySelector('.event__reset-btn');
    if (deleteBtn && deleteBtn.textContent === 'Delete') {
      deleteBtn.textContent = 'Deleting...';
      deleteBtn.disabled = true;
    }
    const saveBtn = this.element.querySelector('.event__save-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
    }
  }

  setDefaultState() {
    const saveBtn = this.element.querySelector('.event__save-btn');
    if (saveBtn) {
      saveBtn.textContent = 'Save';
      saveBtn.disabled = false;
    }
    const deleteBtn = this.element.querySelector('.event__reset-btn');
    if (deleteBtn && deleteBtn.textContent === 'Deleting...') {
      deleteBtn.textContent = 'Delete';
      deleteBtn.disabled = false;
    }
  }

  getData() {
    const destinationId = this._state.destination && typeof this._state.destination === 'object'
      ? this._state.destination.id
      : this._state.destination;

    return {
      type: this._state.type,
      destination: destinationId,
      basePrice: parseInt(this._state.basePrice, 10),
      dateFrom: this._state.dateFrom,
      dateEnd: this._state.dateEnd,
      offers: this._state.offers || [],
      isFavorite: this._state.isFavorite || false
    };
  }

  removeElement() {
    super.removeElement();
    if (this.#datePickerStart) {
      this.#datePickerStart.destroy();
      this.#datePickerStart = null;
    }
    if (this.#datePickerEnd) {
      this.#datePickerEnd.destroy();
      this.#datePickerEnd = null;
    }
  }

  _restoreHandlers() {
    const rollupButton = this.element.querySelector('.event__rollup-btn');
    const resetButton = this.element.querySelector('.event__reset-btn');
    const formElement = this.element.querySelector('form');
    const typeGroup = this.element.querySelector('.event__type-group');
    const destinationField = this.element.querySelector('.event__input--destination');
    const offersContainer = this.element.querySelector('.event__available-offers');
    const priceField = this.element.querySelector('.event__input--price');

    if (rollupButton) {
      rollupButton.addEventListener('click', this.#handleClose);
    }
    if (resetButton) {
      resetButton.addEventListener('click', this.#handleReset);
    }
    if (formElement) {
      formElement.addEventListener('submit', this.#handleSubmit);
    }
    if (typeGroup) {
      typeGroup.addEventListener('change', this.#handleTypeChange);
    }
    if (destinationField) {
      destinationField.addEventListener('change', this.#handleDestinationChange);
    }
    if (offersContainer) {
      offersContainer.addEventListener('change', this.#handleOfferChange);
    }
    if (priceField) {
      priceField.addEventListener('input', this.#handlePriceInput);
    }

    this.#initDatepickers();
  }

  #initDatepickers() {
    if (this._state.isDisabled) {
      return;
    }

    const startInput = this.element.querySelector('#event-start-time-1');
    const endInput = this.element.querySelector('#event-end-time-1');

    if (this.#datePickerStart) {
      this.#datePickerStart.destroy();
    }
    if (this.#datePickerEnd) {
      this.#datePickerEnd.destroy();
    }

    this.#datePickerStart = flatpickr(startInput, {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      defaultDate: this._state.dateFrom,
      onChange: this.#handleStartDateChange,
      'time_24hr': true,
      maxDate: this._state.dateEnd || undefined,
    });

    this.#datePickerEnd = flatpickr(endInput, {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      defaultDate: this._state.dateEnd,
      onChange: this.#handleEndDateChange,
      'time_24hr': true,
      minDate: this._state.dateFrom || undefined,
    });
  }

  #handleStartDateChange = ([selectedDate]) => {
    this._setState({ dateFrom: selectedDate ? selectedDate.toISOString() : '' });
  };

  #handleEndDateChange = ([selectedDate]) => {
    this._setState({ dateEnd: selectedDate ? selectedDate.toISOString() : '' });
  };

  #handleSubmit = (event) => {
    event.preventDefault();
    if (!this._state.destination || this._state.basePrice <= DEFAULT_PRICE || !this._state.dateFrom || !this._state.dateEnd) {
      this.shakeElement();
      return;
    }
    if (this._callback.formSubmit) {
      this._callback.formSubmit();
    } else if (this.#onFormSend) {
      this.#onFormSend(EditForm.parseStateToData(this._state));
    }
  };

  #handleClose = (event) => {
    event.preventDefault();
    if (this._callback.rollupClick) {
      this._callback.rollupClick();
    } else if (this.#onClosePanel) {
      this.#onClosePanel();
    }
  };

  #handleReset = (event) => {
    event.preventDefault();
    if (this._callback.deleteClick) {
      this._callback.deleteClick();
    } else if (this._state.id && this.#onItemDelete) {
      this.#onItemDelete(EditForm.parseStateToData(this._state));
    } else if (this.#onClosePanel) {
      this.#onClosePanel();
    }
  };

  #handleTypeChange = (event) => {
    event.preventDefault();
    this.updateElement({ type: event.target.value, offers: [] });
  };

  #handleDestinationChange = (event) => {
    event.preventDefault();
    const selectedDestination = this.#cityList.find((city) => city.name === event.target.value);
    this.updateElement({ destination: selectedDestination ? selectedDestination.id : '' });
  };

  #handleOfferChange = (event) => {
    if (event.target.tagName !== 'INPUT') {
      return;
    }
    event.preventDefault();

    const offerId = event.target.dataset.offerId;
    const currentSelection = [...this._state.offers];
    const existingIndex = currentSelection.indexOf(offerId);

    if (existingIndex === -1) {
      currentSelection.push(offerId);
    } else {
      currentSelection.splice(existingIndex, 1);
    }

    this._setState({ offers: currentSelection });
  };

  #handlePriceInput = (event) => {
    const rawValue = event.target.value.replace(/[^0-9]/g, '');
    event.target.setCustomValidity('');
    this._setState({ basePrice: Number(rawValue) || DEFAULT_PRICE });
    event.target.value = rawValue;
  };

  static parseDataToState(pointData) {
    const defaultDate = new Date().toISOString();
    const defaultEndDate = new Date(Date.now() + DEFAULT_HOURS_OFFSET * MILLISECONDS_PER_HOUR).toISOString();

    return {
      id: pointData?.id || '',
      type: pointData?.type || 'flight',
      destination: pointData?.destination || '',
      dateFrom: pointData?.dateFrom || defaultDate,
      dateEnd: pointData?.dateEnd || defaultEndDate,
      basePrice: pointData?.basePrice || DEFAULT_PRICE,
      offers: Array.isArray(pointData?.offers) ? [...pointData.offers] : [],
      isFavorite: pointData?.isFavorite || false,
      isEditMode: Boolean(pointData?.id),
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToData(stateData) {
    const result = { ...stateData };
    delete result.isDisabled;
    delete result.isSaving;
    delete result.isDeleting;
    delete result.isEditMode;
    return result;
  }
}
