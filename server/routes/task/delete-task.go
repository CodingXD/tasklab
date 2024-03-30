package task

import (
	"context"
	"log"
	"tasklab/database"
	"tasklab/utils"

	"github.com/gofiber/fiber/v2"
)

func DeleteTask(c *fiber.Ctx) error {
	// getting params values
	v := new(struct {
		Id string `json:"id" validate:"required,uuid4"`
	})
	if err := c.ParamsParser(v); err != nil {
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

	_, err = db.Exec(context.Background(), "DELETE FROM collaborators WHERE task_id = $1", v.Id)
	if err != nil {
		return err
	}

	_, err = db.Exec(context.Background(), "DELETE FROM task WHERE id = $1", v.Id)
	if err != nil {
		return err
	}

	return nil
}
