// Строгий режим
"use strict";
window.addEventListener("load", windowLoad);
const html = document.documentElement;

function windowLoad() {
  document.addEventListener("click", documentActions);
  document.addEventListener(`keydown`, documentActions);
	html.classList.add(`loaded`);
	scrollActions();
}

function documentActions(e) {
  const type = e.type;
  const targetElement = e.target;
  if (type === `click`) {
    // Меню-бургер
    if (targetElement.closest(`.icon-menu`)) {
      //document.documentElement.classList.toggle('open-menu')
      html.classList.toggle(`open-menu`);
    }
    //Попап
    // Закриття
    if (
      document.querySelector(`.popup--open`) &&
      (!targetElement.closest(`.body-popup`) ||
        targetElement.closest(`.body-popup__close`))
    ) {
      popupClose();
    }
    // Відкриття
    if (targetElement.closest(`[data-popup]`)) {
      const curentElement = targetElement.closest(`[data-popup]`);
      popupOpen(curentElement);
    }
  } else if (type === `keydown`) {
    const key = e.key;
    if (key === `Escape`) {
      document.querySelector(".popup--open") ? popupClose() : null;
    }
  }
  function popupClose() {
    const curentPopup = document.querySelector(`.popup--open`);
    curentPopup.classList.remove(`popup--open`);
    setTimeout(() => {
      bodyLock(false);
    }, 500);
  }
  function popupOpen(curentElement) {
    const curentPopup = document.querySelector(curentElement.dataset.popup);
    if (curentPopup) {
      curentPopup.classList.add(`popup--open`);
      setTimeout(() => {
        bodyLock(true);
      }, 500);
    } else {
      console.log(`Такого попапу не існує`);
    }
  }
}
function bodyLock(type) {
	document.documentElement.classList.toggle(`lock`, type);
}

//===========================================================
function DynamicAdapt(type) {
  this.type = type;
}
DynamicAdapt.prototype.init = function () {
  const _this = this;
  // массив объектов
  this.оbjects = [];
  this.daClassname = `_dynamic_adapt_`;
  // массив DOM-элементов
  this.nodes = document.querySelectorAll(`[data-da]`);
  // наполнение оbjects объктами
  for (let i = 0; i < this.nodes.length; i++) {
    const node = this.nodes[i];
    const data = node.dataset.da.trim();
    const dataArray = data.split(`,`);
    const оbject = {};
    оbject.element = node;
    оbject.parent = node.parentNode;
    оbject.destination = document.querySelector(dataArray[0].trim());
    оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : `767`;
    оbject.place = dataArray[2] ? dataArray[2].trim() : `last`;
    оbject.index = this.indexInParent(оbject.parent, оbject.element);
    this.оbjects.push(оbject);
  }
  this.arraySort(this.оbjects);
  // массив уникальных медиа-запросов
  this.mediaQueries = Array.prototype.map.call(
    this.оbjects,
    function (item) {
      return (
        `(` +
        this.type +
        `-width: ` +
        item.breakpoint +
        `px),` +
        item.breakpoint
      );
    },
    this
  );
  this.mediaQueries = Array.prototype.filter.call(
    this.mediaQueries,
    function (item, index, self) {
      return Array.prototype.indexOf.call(self, item) === index;
    }
  );
  // навешивание слушателя на медиа-запрос
  // и вызов обработчика при первом запуске
  for (let i = 0; i < this.mediaQueries.length; i++) {
    const media = this.mediaQueries[i];
    const mediaSplit = String.prototype.split.call(media, `,`);
    const matchMedia = window.matchMedia(mediaSplit[0]);
    const mediaBreakpoint = mediaSplit[1];
    // массив объектов с подходящим брейкпоинтом
    const оbjectsFilter = Array.prototype.filter.call(
      this.оbjects,
      function (item) {
        return item.breakpoint === mediaBreakpoint;
      }
    );
    matchMedia.addListener(function () {
      _this.mediaHandler(matchMedia, оbjectsFilter);
    });
    this.mediaHandler(matchMedia, оbjectsFilter);
  }
};
DynamicAdapt.prototype.mediaHandler = function (matchMedia, оbjects) {
  if (matchMedia.matches) {
    for (let i = 0; i < оbjects.length; i++) {
      const оbject = оbjects[i];
      оbject.index = this.indexInParent(оbject.parent, оbject.element);
      this.moveTo(оbject.place, оbject.element, оbject.destination);
    }
  } else {
    //for (let i = 0; i < оbjects.length; i++) {
    for (let i = оbjects.length - 1; i >= 0; i--) {
      const оbject = оbjects[i];
      if (оbject.element.classList.contains(this.daClassname)) {
        this.moveBack(оbject.parent, оbject.element, оbject.index);
      }
    }
  }
};
// Функция перемещения
DynamicAdapt.prototype.moveTo = function (place, element, destination) {
  element.classList.add(this.daClassname);
  if (place === `last` || place >= destination.children.length) {
    destination.insertAdjacentElement(`beforeend`, element);
    return;
  }
  if (place === `first`) {
    destination.insertAdjacentElement(`afterbegin`, element);
    return;
  }
  destination.children[place].insertAdjacentElement(`beforebegin`, element);
};
// Функция возврата
DynamicAdapt.prototype.moveBack = function (parent, element, index) {
  element.classList.remove(this.daClassname);
  if (parent.children[index] !== undefined) {
    parent.children[index].insertAdjacentElement(`beforebegin`, element);
  } else {
    parent.insertAdjacentElement(`beforeend`, element);
  }
};
// Функция получения индекса внутри родителя
DynamicAdapt.prototype.indexInParent = function (parent, element) {
  const array = Array.prototype.slice.call(parent.children);
  return Array.prototype.indexOf.call(array, element);
};
// Функция сортировки массива по breakpoint и place
// по возрастанию для this.type = min
// по убыванию для this.type = max
DynamicAdapt.prototype.arraySort = function (arr) {
  if (this.type === `min`) {
    Array.prototype.sort.call(arr, function (a, b) {
      if (a.breakpoint === b.breakpoint) {
        if (a.place === b.place) {
          return 0;
        }

        if (a.place === `first` || b.place === `last`) {
          return -1;
        }

        if (a.place === `last` || b.place === `first`) {
          return 1;
        }

        return a.place - b.place;
      }

      return a.breakpoint - b.breakpoint;
    });
  } else {
    Array.prototype.sort.call(arr, function (a, b) {
      if (a.breakpoint === b.breakpoint) {
        if (a.place === b.place) {
          return 0;
        }

        if (a.place === `first` || b.place === `last`) {
          return 1;
        }

        if (a.place === `last` || b.place === `first`) {
          return -1;
        }

        return b.place - a.place;
      }

      return b.breakpoint - a.breakpoint;
    });
    return;
  }
};
const da = new DynamicAdapt(`max`);
da.init();
//===========================================================

const sliderLisOn = new Swiper(".slider-jop__swiper", {
  slidesPerView: 2.5,

  // Optional parameters
  direction: "horizontal",
  loop: true,

  // If we need pagination
  pagination: {
    el: ".swiper-pagination",
  },

  // Navigation arrows
  navigation: {
    nextEl: ".jop__arrow--left",
    prevEl: ".jop__arrow--right",
  },

  // And if we need scrollbar
  scrollbar: {
    el: ".swiper-scrollbar",
  },
});

const sliderLisTon = new Swiper(".word__swiper", {
  slidesPerView: 2.5,
  zoom: true,
  // Optional parameters
  direction: "horizontal",
  loop: true,

  // If we need pagination
  pagination: {
    el: ".word__pagination",
    clickable: true,
    bulletClass: `word__bullet`,
    bulletActiveClass: `word__bullet--active`,
  },
});

function scrollActions() {
	window.addEventListener('scroll', scrollAction)

	function scrollAction() {
		// Робота з шапкою
		const header = document.querySelector(".header");
		header.classList.toggle(`header--scroll`, window.scrollY > 50);
	}
 }
