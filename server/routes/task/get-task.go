package task

import (
	"context"
	"log"
	"tasklab/database"
	"tasklab/utils"

	"github.com/gofiber/fiber/v2"
)

func GetTask(c *fiber.Ctx) error {
	// getting param values
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

	ctx := context.Background()

	var title, description, status string
	var dueDate interface{}
	err = db.QueryRow(ctx, "SELECT title, description, status, TO_CHAR(due_date, 'YYYY-mm-dd') FROM tasks WHERE id = $1", v.Id).Scan(&title, &description, &status, &dueDate)
	if err != nil {
		return err
	}

	rows, err := db.Query(ctx, "SELECT users.id, first_name, last_name, email FROM collaborators, users WHERE collaborators.user_id = users.id AND task_id = $1", v.Id)
	if err != nil {
		return err
	}

	type User struct {
		Id        string `json:"id"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
	}

	var users []User
	for rows.Next() {
		var r User
		err = rows.Scan(&r.Id, &r.FirstName, &r.LastName, &r.Email)
		if err != nil {
			return err
		}
		users = append(users, r)
	}

	if rows.Err() != nil {
		return rows.Err()
	}

	type Response struct {
		Title         string      `json:"title"`
		Description   string      `json:"description,omitempty"`
		Status        string      `json:"status"`
		DueDate       interface{} `json:"dueDate,omitempty"`
		Collaborators []User      `json:"collaborators"`
	}

	return c.JSON(Response{
		Title:         title,
		Description:   description,
		Status:        status,
		DueDate:       dueDate,
		Collaborators: users,
	})
}
