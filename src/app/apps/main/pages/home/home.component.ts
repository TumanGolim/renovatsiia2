import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface WorkType {
  name: string;
  subtypes: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  selectedCategory: string | null = null;

  categories: WorkType[] = [
    {
      name: 'Стены',
      subtypes: [
        'Покраска',
        'Обои',
        'Штукатурка',
        'Плитка',
        'Декоративная отделка',
      ],
    },
    {
      name: 'Потолки',
      subtypes: ['Натяжные', 'Гипсокартон', 'Покраска', 'Подвесные'],
    },
    {
      name: 'Пол',
      subtypes: ['Ламинат', 'Плитка', 'Паркет', 'Линолеум', 'Стяжка'],
    },
    {
      name: 'Сантехника',
      subtypes: [
        'Установка ванны',
        'Установка душевой кабины',
        'Монтаж труб',
        'Установка раковины',
        'Подключение стиральной машины',
      ],
    },
    {
      name: 'Электрика',
      subtypes: [
        'Проводка',
        'Установка розеток',
        'Монтаж освещения',
        'Электрощит',
      ],
    },
    {
      name: 'Двери и окна',
      subtypes: ['Установка дверей', 'Установка окон', 'Откосы', 'Подоконники'],
    },
    {
      name: 'Балкон и лоджия',
      subtypes: ['Остекление', 'Утепление', 'Отделка'],
    },
    {
      name: 'Дополнительные работы',
      subtypes: ['Уборка', 'Вывоз мусора', 'Демонтаж', 'Дизайн интерьера'],
    },
  ];

  selectCategory(category: string): void {
    if (this.selectedCategory === category) {
      this.selectedCategory = null;
    } else {
      this.selectedCategory = category;
    }
  }

  selectSubtype(category: string, subtype: string): void {
    // Просто логируем выбор подкатегории без перехода на другую страницу
    console.log(`Выбрана категория: ${category}, подкатегория: ${subtype}`);
    // Здесь в будущем может быть дополнительная логика
  }
}
