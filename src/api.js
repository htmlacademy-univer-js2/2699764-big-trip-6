import ApiService from './framework/api-service.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class TravelApi extends ApiService {
  get points() {
    return this._load({ url: 'points' })
      .then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({ url: 'destinations' })
      .then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({ url: 'offers' })
      .then(ApiService.parseResponse);
  }

  async _load({ url, method = 'GET', body = null, headers = new Headers() }) {
    const response = await super._load({ url, method, body, headers });
    return response;
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#toServer(point)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    return await ApiService.parseResponse(response);
  }

  async addPoint(point) {
    const response = await this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(this.#toServer(point)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    return await ApiService.parseResponse(response);
  }

  async deletePoint(point) {
    return await this._load({
      url: `points/${point.id}`,
      method: Method.DELETE,
    });
  }

  #toServer(point) {
    let offersIds = point.offers || [];
    if (offersIds.length > 0 && typeof offersIds[0] === 'object') {
      offersIds = offersIds.map((offer) => offer.id);
    }

    const adapted = {
      ...point,
      'base_price': point.basePrice,
      'date_from': point.dateFrom,
      'date_to': point.dateEnd,
      'is_favorite': point.isFavorite,
      'offers': offersIds,
    };

    delete adapted.basePrice;
    delete adapted.dateFrom;
    delete adapted.dateEnd;
    delete adapted.isFavorite;

    if (!adapted.id) {
      delete adapted.id;
    }

    return adapted;
  }
}
