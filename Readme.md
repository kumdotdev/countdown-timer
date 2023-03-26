# Countdown Timer Web Component

Vanilla JS one-file Web Component dependency free and framework agnostic. No build required. Use it as is.

## Demo

[Visit the demo page for usage examples.](https://kumdotdev.github.io/countdown-timer/)

## Install

```
npm i @kumdotdev/countdown-timer
```

## Import
### CDN
```HTML
<script async type="module" src="https://unpkg.com/@kumdotdev/countdown-timer/countdown-timer.js"></script>
```

### Local install
```HTML
<script async type="module" src="/node_modules/@kumdotdev/countdown-timer/countdown-timer.js"></script>
```

### Import as module
```HTML
<script type="module">
  import '/node_modules/@kumdotdev/countdown-timer/countdown-timer.js';
  // ...
</script>
```

## Usage

**Use ISO 8601 date format to provide the desired enddate!**

The shorter version `2024-01-01T23:42` should work also.

```HTML
<countdown-timer 
  date="2023-01-01T23:42:00.000+01:00">
</countdown-timer>
```

## Language support

English, French and German provided. You can add more languages to `L10N` constant. Defaults to english language. 

## Attributes

Attribute |  Description
--- | ---
alarm | [Optional] Time left in seconds to begin with pulsating the timer
date | ISO 8601 date for desired countdown target date

## Styling

Variable |  Desciption or additional info | Default
--- | --- | ---
--cdt-digit-font-size | Size of the timer digits. Use `inherit` to inherit from parent element's font-size | 2rem
--cdt-digit-font-family | On the demo page the counter used `monospace` family | inherit
normal--cdt-digit-font-weight | Another useful values could be `400` (normal) | 700
--cdt-digit-text-color | | #fefefe
--cdt-digit-box-color | You can set the box color to `transparent` to omit the colored digit box | #111
--cdt-label-font-size | The font size of the label beneath the digits | 0.75rem
