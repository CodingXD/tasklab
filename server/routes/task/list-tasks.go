package task

import (
	"context"
	"fmt"
	"log"
	"tasklab/database"
	"tasklab/utils"

	"github.com/gofiber/fiber/v2"
)

func ListTasks(c *fiber.Ctx) error {
	// getting query values
	v := new(struct {
		Limit  int    `json:"limit" validate:"required,gte=1"`
		Offset int    `json:"offset" validate:"omitempty,gte=0"`
		Status string `json:"status" validate:"oneof=all todo inprogress done"`
		UserId string `json:"userId" validate:"required,uuid4"`
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
		Id          string      `json:"id"`
		Title       string      `json:"title"`
		Description string      `json:"description,omitempty"`
		Status      string      `json:"status"`
		DueDate     interface{} `json:"dueDate,omitempty"`
		CreatorId   string      `json:"creatorId"`
		FirstName   string      `json:"firstName"`
		LastName    string      `json:"lastName"`
		Email       string      `json:"email"`
		Role        string      `json:"role"`
	}

	ctx := context.Background()

	// Get user role
	var role string
	err = db.QueryRow(ctx, "SELECT role FROM users WHERE id = $1", v.UserId).Scan(&role)
	if err != nil {
		return err
	}

	var total int
	if role == "admin" {
		err = db.QueryRow(ctx, "SELECT COUNT(*) FROM tasks").Scan(&total)
		if err != nil {
			return err
		}
	} else {
		err = db.QueryRow(ctx, "SELECT COUNT(*) FROM tasks, users WHERE tasks.created_by = users.id AND users.id = $1", v.UserId).Scan(&total)
		if err != nil {
			return err
		}
	}

	query := "SELECT tasks.id, title, description, status, due_date, users.id, first_name, last_name, email, role FROM tasks, users WHERE tasks.created_by = users.id"
	var args []interface{}
	ctr := 0
	if role == "member" {
		ctr++
		query += fmt.Sprintf(" AND created_by = $%d", ctr)
		args = append(args, v.UserId)
	}

	if v.Status != "all" {
		query += fmt.Sprintf(" AND status = $%d limit $%d offset $%d", ctr+1, ctr+2, ctr+3)
		args = append(args, v.Status, v.Limit, v.Offset)
	} else {
		query += fmt.Sprintf(" limit $%d offset $%d", ctr+1, ctr+2)
		args = append(args, v.Limit, v.Offset)
	}
	rows, err := db.Query(ctx, query, args...)
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
