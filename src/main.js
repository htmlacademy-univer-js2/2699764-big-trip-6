import BoardPresenter from './presenter/board-presenter.js';
import PointsModel from './model/point-model.js';
import FilterModel from './model/filter-model.js';
import TravelApi from './api.js';

const RANDOM_BASE = 36;
const TRIM_START = 2;

const AUTH = `Basic ${Math.random().toString(RANDOM_BASE).slice(TRIM_START)}`;
const SERVER = 'https://24.objects.htmlacademy.pro/big-trip';

const api = new TravelApi(SERVER, AUTH);
const pointsModel = new PointsModel({ apiService: api });
const filterModel = new FilterModel();

const presenter = new BoardPresenter({
  pointsModel: pointsModel,
  filterModel: filterModel,
});

presenter.init();
pointsModel.init();
