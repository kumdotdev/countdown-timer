const L10N = {
  en: ['Days', 'Hours', 'Minutes', 'Seconds'],
  fr: ['Jours', 'Heures', 'Minutes', 'Secondes'],
  de: ['Tage', 'Stunden', 'Minuten', 'Sekunden'],
};
const UNITS = ['day', 'hour', 'minute', 'second'];
const ISO_8601 =
  /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;
const MS_IN_A_SECOND = 1000;
const MS_IN_A_MINUTE = 60 * MS_IN_A_SECOND;
const MS_IN_A_HOUR = 60 * MS_IN_A_MINUTE;
const MS_IN_A_DAY = 24 * MS_IN_A_HOUR;
const MS_IN_A_YEAR = 365 * MS_IN_A_DAY;
const { abs, floor } = Math;

const getLanguage = () =>
  document.documentElement.lang?.substring(0, 2) ||
  navigator.language?.substring(0, 2) ||
  'en';

const $t = (name, lang = getLanguage()) => {
  const index = UNITS.indexOf(name);
  return L10N[lang]?.[index] ? L10N[lang][index] : L10N['en'][index];
};

class CountDownTimer extends HTMLElement {
  static get observedAttributes() {
    return ['alarm', 'date'];
  }
  constructor() {
    super();
    this.state = {
      date: new Date().toISOString(),
      alarm: '',
      error: '',
    };
  }
  setState(newState) {
    this.state = {
      ...this.state,
      ...newState,
    };
    // console.log('New State: ', this.state);
    this.updateView();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    this.element = document.createElement('div');
    this.checkAttributes({ date: this.getAttribute('date') });
    this.setState({
      alarm: this.getAttribute('alarm'),
      date: this.getAttribute('date'),
    });
    this.update(new Date(this.state.date) - new Date());
    this.tick = setInterval(() => {
      const counter = new Date(this.state.date) - new Date();
      this.update(counter);
    }, 1_000);
    const style = document.createElement('style');
    style.textContent = `
      div {
        display: inline-grid;
        justify-content: center;
        grid-auto-flow: column;
        gap: clamp(.5rem, .15em, 1rem);
        font-size: var(--cdt-digit-font-size, 3rem);
        line-height: 1;
      }
      span {
        font-size: 1rem;
      }
      .pulse {
        animation: ease-in-out pulse .25s alternate infinite;
      }
      @keyframes pulse {
        from {
          scale: .98;
        }
        to {
          scale: 1;
        }
      }
    `;
    shadow.appendChild(style);
    shadow.appendChild(this.element);
  }

  updateView() {
    if (this.element) {
      if (this.state.error) {
        this.element.innerHTML = `<span>${this.state.error}</span>`;
      } else {
        this.element.innerHTML = UNITS.map(
          (unit) => `<ct-number unit="${unit}" number="0"></ct-number>`,
        ).join('');
      }
    }
  }

  checkAttributes({ date, alarm }) {
    if (date === undefined) return;
    if (date === '') {
      this.setState({ error: 'No date provided.' });
      return;
    }
    if (!date.match(ISO_8601)) {
      this.setState({ error: 'No valid ISO 8601 date format provided.' });
      return;
    }
    this.setState({ error: '' });
  }

  format(ms, unit) {
    let value;
    switch (unit) {
      case 'day':
        value = ms / MS_IN_A_DAY;
        break;
      case 'hour':
        value = (ms % MS_IN_A_DAY) / MS_IN_A_HOUR;
        break;
      case 'minute':
        value = (ms % MS_IN_A_HOUR) / MS_IN_A_MINUTE;
        break;
      case 'second':
        value = (ms % MS_IN_A_MINUTE) / MS_IN_A_SECOND;
        break;
      default:
        value = 0;
        break;
    }
    if (unit === 'day') return floor(value).toString();
    return floor(value).toString().padStart(2, '0');
  }

  update(counter) {
    if (counter <= 0) {
      clearInterval(this.tick);
      counter = 0;
    }
    UNITS.map((unit) => {
      const element = this.element.querySelector(`[unit="${unit}"]`);
      element?.setAttribute('number', this.format(abs(counter), unit));
    });
    const timeLeft = counter / MS_IN_A_SECOND;
    this.element.classList.toggle(
      'pulse',
      timeLeft < this.state.alarm && timeLeft > 0,
    );
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.checkAttributes({ [name]: newValue });
    this.setState({ [name]: newValue });
  }
}
customElements.define('countdown-timer', CountDownTimer);

class CountDownTimerNumber extends HTMLElement {
  static get observedAttributes() {
    return ['number'];
  }

  constructor(){
    super();
    this.digits = [];
  }

  connectedCallback() {
    this.digits = [];
    const shadow = this.attachShadow({ mode: 'open' });
    this.element = document.createElement('div');
    this.element.setAttribute('title', $t(this.getAttribute('unit')));
    this.element.insertAdjacentHTML(
      'afterbegin',
      `<div class="wrapper"></div>
      <span>${$t(this.getAttribute('unit'))}</span>
    `,
    );
    const style = document.createElement('style');
    style.textContent = `
      div {
        display: grid;
        justify-items: center;
        gap: .5rem;
      }
      .wrapper {
        display:flex; 
        gap: 2px;
      }
      span {
        font-size: var(--cdt-label-font-size, .75rem);
      }
    `;
    shadow.appendChild(style);
    shadow.appendChild(this.element);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.digits.length === 0) {
      this.digits = [
        ...this.getAttribute('number')
          .split('')
          .map(() => document.createElement('ct-digit')),
      ];
      this.digits.forEach((digit) => {
        this.element?.querySelector('.wrapper').appendChild(digit);
      });
    }
    if (this.digits.length > 0) {
      newValue.split('').forEach((value, index) => {
        this.digits[index]?.setAttribute('digit', value);
      });
    }
  }
}
customElements.define('ct-number', CountDownTimerNumber);

class CountDownTimerDigit extends HTMLElement {
  static get observedAttributes() {
    return ['digit'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    this.element = document.createElement('span');
    this.element.classList.add('digit');
    this.element.innerHTML =
      '<span class="current"></span><span class="new"></span>';
    const style = document.createElement('style');
    style.textContent = `
      .digit {
        display: grid;
        font-family: var(--cdt-digit-font-family, inherit);
        font-weight: var(--cdt-digit-font-weight, 700);
        color: var(--cdt-digit-text-color, #fefefe);
        background-color: var(--cdt-digit-box-color, #111);
        border-radius: clamp(2px, .1em, 10px);
        position: relative;
      }
      .current, .new {
        padding: .1em;
      }
      .new {
        position: absolute;
        left: 0;
        opacity: 0;
        tranform-origin: bottom center;
        transform: translateY(-40%) scale(.9, .2);
      }
      .flip .current {
        opacity: 0;
        transform-origin: top center;
        transform: translateY(70%) scale(.8, .2);
        transition: .4s;
      }
      .flip .new {
        opacity: 1;
        transform: translateY(0);
        transition: .6s;
      }
    `;
    shadow.appendChild(style);
    shadow.appendChild(this.element);
  }

  attributeChangedCallback(_, oldValue, newValue) {
    const currentElement = this.element.querySelector('.current');
    const newElement = this.element.querySelector('.new');
    if (!oldValue) {
      currentElement.innerText = newValue;
    }
    if (newValue !== oldValue) {
      newElement.innerText = newValue;
      this.element.classList.add('flip');
      setTimeout(() => {
        currentElement.innerText = newValue;
        newElement.innerText = '';
        this.element.classList.remove('flip');
      }, 600);
    }
  }
}
customElements.define('ct-digit', CountDownTimerDigit);
