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
  selectedSubcategories: Subcategory[] = [];
  allMasters: any[] = [];
  filteredMasters: any[] = [];
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
    if (this.selectedCategory !== category) {
      this.selectedCategory = category;
    }
  }

  selectSubcategory(subcategory: Subcategory): void {
    const index = this.selectedSubcategories.findIndex(s => s.subcategory_id === subcategory.subcategory_id);
    if (index > -1) {
      this.selectedSubcategories.splice(index, 1);
    } else {
      this.selectedSubcategories.push(subcategory);
    }
    this.loadMastersBySubcategories();
  }

  loadMastersBySubcategories(): void {
    const subcategoryIds = this.selectedSubcategories.map(s => s.subcategory_id);
    this.profileService.getMasters().subscribe(masters => {
      this.filteredMasters = masters.filter(master =>
        master.services.some((service: { subcategory_id: number }) => subcategoryIds.includes(service.subcategory_id))
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