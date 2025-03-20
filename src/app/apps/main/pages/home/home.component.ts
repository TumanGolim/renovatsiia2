import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, } from '@angular/common';

import { ProfileService } from '../../../../core/services/profile.service';
import { ServiceCategory, Subcategory } from '../../../../core/models/services.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  serviceCategories: ServiceCategory[] = [];
  selectedCategory: ServiceCategory | null = null;
  selectedSubcategory: Subcategory | null = null;
  masters: any[] = [];
  private profileService = inject(ProfileService)

  ngOnInit(): void {
    this.loadServiceCategories()
  }

  loadServiceCategories(): void {
    this.profileService.getServices().subscribe(categories => {
      this.serviceCategories = categories;
      console.log(this.serviceCategories)
    });
  }

  selectCategory(category: ServiceCategory): void {
    this.selectedCategory = category;
    this.selectedSubcategory = null;
    this.loadMastersByCategory(category.category_id);
  }

  selectSubcategory(subcategory: Subcategory): void {
    this.selectedSubcategory = subcategory;
    this.loadMastersBySubcategory(subcategory.subcategory_id);
  }

  loadMastersByCategory(categoryId: number): void {
    this.profileService.getMastersByCategory(categoryId).subscribe(masters => {
      this.masters = masters.filter(master => 
        master.service_categories.some((category: { category_id: number }) => category.category_id === categoryId)
      );
    });
  }

  loadMastersBySubcategory(subcategoryId: number): void {
    this.profileService.getMastersBySubcategory(subcategoryId).subscribe(masters => {
      this.masters = masters.filter(master => 
        master.services.some((service: { subcategory_id: number }) => service.subcategory_id === subcategoryId)
      );
    });
  }

  toggleSubcategories(category: ServiceCategory): void {
    if (this.selectedCategory === category) {
      this.selectedCategory = null;
    } else {
      this.selectedCategory = category;
    }
  }
}