package task

import (
	"context"
	"log"
	"tasklab/database"
	"tasklab/utils"

	"github.com/gofiber/fiber/v2"
)

func ListTasks(c *fiber.Ctx) error {
	// getting query values
	v := new(struct {
		Limit  int `json:"limit" validate:"required,gte=1"`
		Offset int `json:"offset" validate:"omitempty,gte=0"`
	})
	if err := c.QueryParser(v); err != nil {
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

	type Response struct {
		Id          string `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description,omitempty"`
		Status      string `json:"status"`
		DueDate     string `json:"dueDate,omitempty"`
		CreatorId   string `json:"creatorId"`
		FirstName   string `json:"firstName"`
		LastName    string `json:"lastName"`
		Email       string `json:"email"`
		Role        string `json:"role"`
	}

	ctx := context.Background()

	var total int
	err = db.QueryRow(ctx, "SELECT COUNT(*) FROM tasks, users WHERE tasks.created_by = users.id").Scan(&total)
	if err != nil {
		return err
	}

	rows, err := db.Query(ctx, "SELECT tasks.id, title, description, status, due_date, users.id, first_name, last_name, email, role FROM tasks, users WHERE tasks.created_by = users.id limit $1 offset $2", v.Limit, v.Offset)
	if err != nil {
		return err
	}

	var tasks []Response
	for rows.Next() {
		var r Response
		err = rows.Scan(&r.Id, &r.Title, &r.Description, &r.Status, &r.DueDate, &r.CreatorId, &r.FirstName, &r.LastName, &r.Email, &r.Role)
		if err != nil {
			return err
		}
		tasks = append(tasks, r)
	}

	if rows.Err() != nil {
		return rows.Err()
	}

	type Paginate struct {
		Limit  int        `json:"limit"`
		Offset int        `json:"offset"`
		Total  int        `json:"total"`
		Data   []Response `json:"data"`
	}

	return c.JSON(Paginate{
		Limit:  v.Limit,
		Offset: v.Offset,
		Total:  total,
		Data:   tasks,
	})
}
