package service

import (
	"backend/internal/models"
	"backend/internal/repository"
	"errors"
)

type CategoryService interface {
	GetAllCategories() ([]models.CategoryResponse, error)
	GetCategoryDetail(id uint) (*models.CategoryResponse, error)
	CreateCategory(req *models.CreateCategoryRequest) (*models.CategoryResponse, error)
	UpdateCategory(id uint, req *models.UpdateCategoryRequest) (*models.CategoryResponse, error)
	DeleteCategory(id uint) error
}

type categoryService struct {
	categoryRepo repository.CategoryRepository
}

func NewCategoryService(categoryRepo repository.CategoryRepository) CategoryService {
	return &categoryService{categoryRepo: categoryRepo}
}

func (s *categoryService) GetAllCategories() ([]models.CategoryResponse, error) {
	categories, err := s.categoryRepo.FindAll()
	if err != nil {
		return nil, err
	}

	responses := make([]models.CategoryResponse, len(categories))
	for i, category := range categories {
		responses[i] = category.ToCategoryResponse()
	}
	return responses, nil
}

func (s *categoryService) GetCategoryDetail(id uint) (*models.CategoryResponse, error) {
	category, err := s.categoryRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("Category not found")
	}
	res := category.ToCategoryResponse()
	return &res, nil
}

func (s *categoryService) CreateCategory(req *models.CreateCategoryRequest) (*models.CategoryResponse, error) {
	category := models.Category{
		Name:        req.Name,
		Description: req.Description,
	}

	if err := s.categoryRepo.Create(&category); err != nil {
		return nil, err
	}

	res := category.ToCategoryResponse()
	return &res, nil
}

func (s *categoryService) UpdateCategory(id uint, req *models.UpdateCategoryRequest) (*models.CategoryResponse, error) {
	category, err := s.categoryRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("Category not found")
	}

	category.Name = req.Name
	category.Description = req.Description

	if err := s.categoryRepo.Update(category); err != nil {
		return nil, err
	}

	res := category.ToCategoryResponse()
	return &res, nil
}

func (s *categoryService) DeleteCategory(id uint) error {
	if _, err := s.categoryRepo.FindByID(id); err != nil {
		return errors.New("Category not found")
	}
	return s.categoryRepo.Delete(id)
}
