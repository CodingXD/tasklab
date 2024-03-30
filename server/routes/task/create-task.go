package task

import (
	"context"
	"fmt"
	"log"
	"tasklab/database"
	"tasklab/utils"

	"github.com/gofiber/fiber/v2"
)

func CreateTask(c *fiber.Ctx) error {
	// getting body values
	v := new(struct {
		Title         string   `json:"title" validate:"required,min=1"`
		Description   string   `json:"description" validate:"omitempty"`
		CreatedBy     string   `json:"createdBy" validate:"required,uuid4"`
		DueDate       string   `json:"dueDate" validate:"omitempty,datetime=2006-01-02"`
		Status        string   `json:"status" validate:"required,oneof=todo inprogress done"`
		Collaborators []string `json:"collaborators" validate:"required,gte=0,dive,uuid4"`
	})
	if err := c.BodyParser(v); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	// Validation
	if err := utils.ValidateStruct(v); len(err) != 0 {
		return c.Status(fiber.StatusBadRequest).JSON(err)
	}

	// getting db instance
	db, err := database.GetDB()
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	ctx := context.Background()

	var id string
	args := []interface{}{v.Title, v.Status, v.CreatedBy, nil, nil}
	if v.Description != "" {
		args[3] = v.Description
	}
	if v.DueDate != "" {
		args[4] = v.DueDate
	}
	err = db.QueryRow(ctx, "INSERT INTO tasks(title, status, created_by, description, due_date) VALUES($1, $2, $3, $4, $5) RETURNING id", args...).Scan(&id)
	if err != nil {
		return err
	}

	if len(v.Collaborators) > 0 {
		query := "INSERT INTO collaborators(task_id, user_id) VALUES($1, $2)"
		ctr := 2
		args := []interface{}{id, v.Collaborators[0]}
		for i := 1; i < len(v.Collaborators); i++ {
			args = append(args, id, v.Collaborators[i])
			query += fmt.Sprintf(", ($%d, $%d)", ctr+1, ctr+2)
			ctr += 2
		}

		_, err = db.Exec(ctx, query, args...)
		if err != nil {
			return err
		}
	}

	return c.SendString(id)
}
