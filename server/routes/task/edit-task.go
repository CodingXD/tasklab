package task

import (
	"context"
	"fmt"
	"log"
	"tasklab/database"
	"tasklab/utils"

	"github.com/gofiber/fiber/v2"
)

func EditTask(c *fiber.Ctx) error {
	// getting body values
	v := new(struct {
		Id            string   `json:"id" validate:"required,uuid4"`
		Title         string   `json:"title" validate:"required,min=1"`
		Description   string   `json:"description" validate:"omitempty"`
		DueDate       string   `json:"dueDate" validate:"omitempty,datetime"`
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

	_, err = db.Exec(ctx, "UPDATE tasks SET title = $1, description = $2, status = $3, due_date = $4, updated_at = NOW() WHERE id = $5", v.Title, v.Description, v.Status, v.DueDate, v.Id)
	if err != nil {
		return err
	}

	_, err = db.Exec(ctx, "DELETE FROM collaborators WHERE task_id = $1", v.Id)
	if err != nil {
		return err
	}

	if len(v.Collaborators) > 0 {
		query := "INSERT INTO collaborators(task_id, user_id) VALUES($1, $2)"
		ctr := 2
		args := []interface{}{v.Id, v.Collaborators[0]}
		for i := 1; i < len(v.Collaborators); i++ {
			args = append(args, v.Id, v.Collaborators[i])
			query += fmt.Sprintf(", ($%d, $%d)", ctr+1, ctr+2)
			ctr += 2
		}

		_, err = db.Exec(ctx, query, args...)
		if err != nil {
			return err
		}
	}

	return nil
}
