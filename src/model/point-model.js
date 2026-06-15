import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

export default class PointsModel extends Observable {
  #apiService = null;
  #points = [];
  #destinations = [];
  #offers = [];

  constructor({ apiService }) {
    super();
    this.#apiService = apiService;
  }

  getPoints() {
    return this.#points;
  }

  getDestinations() {
    return this.#destinations;
  }

  getOffers() {
    return this.#offers;
  }

  getDestinationById(id) {
    return this.#destinations.find((dest) => dest.id === id);
  }

  getOffersByType(type) {
    const offerGroup = this.#offers.find((offer) => offer.type === type);
    return offerGroup ? offerGroup.offers : [];
  }

  getOfferById(type, id) {
    const typeOffers = this.getOffersByType(type);
    return typeOffers.find((offer) => offer.id === id);
  }

  async init() {
    try {
      const serverPoints = await this.#apiService.points;
      this.#destinations = await this.#apiService.destinations;
      this.#offers = await this.#apiService.offers;
      this.#points = serverPoints.map(this.#adaptToClient);
      this._notify(UpdateType.INIT, { isError: false });
    } catch (err) {
      this.#points = [];
      this.#destinations = [];
      this.#offers = [];
      this._notify(UpdateType.INIT, { isError: true });
    }
  }

  async updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Cannot update non-existent point');
    }
    try {
      const response = await this.#apiService.updatePoint(update);
      const updatedPoint = this.#adaptToClient(response);
      this.#points = [
        ...this.#points.slice(0, index),
        updatedPoint,
        ...this.#points.slice(index + 1),
      ];
      this._notify(updateType, updatedPoint);
    } catch (err) {
      throw new Error('Failed to update point');
    }
  }

  async addPoint(updateType, update) {
    try {
      const response = await this.#apiService.addPoint(update);
      const newPoint = this.#adaptToClient(response);
      this.#points = [newPoint, ...this.#points];
      this._notify(updateType, newPoint);
    } catch (err) {
      throw new Error('Failed to add point');
    }
  }

  async deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Cannot delete non-existent point');
    }
    try {
      await this.#apiService.deletePoint(update);
      this.#points = [
        ...this.#points.slice(0, index),
        ...this.#points.slice(index + 1),
      ];
      this._notify(updateType);
    } catch (err) {
      throw new Error('Failed to delete point');
    }
  }

  #adaptToClient(point) {
    return {
      ...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'],
      dateEnd: point['date_to'],
      isFavorite: point['is_favorite'],
    };
  }
}
