package user

import (
	"context"
	"log"
	"strings"
	"tasklab/database"
	"tasklab/utils"

	"github.com/gofiber/fiber/v2"
)

func FindUsers(c *fiber.Ctx) error {
	// getting query values
	v := new(struct {
		Q string `json:"q" validate:"required,gte=1"`
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
		Id        string `json:"id"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
	}

	q := strings.ToLower(v.Q)
	q += "%"
	rows, err := db.Query(context.Background(), "SELECT id, first_name, last_name, email FROM users WHERE first_name LIKE $1 OR email LIKE $2 limit 10", q, q)
	if err != nil {
		return err
	}

	var users []Response
	for rows.Next() {
		var r Response
		err = rows.Scan(&r.Id, &r.FirstName, &r.LastName, &r.Email)
		if err != nil {
			return err
		}
		users = append(users, r)
	}

	if rows.Err() != nil {
		return rows.Err()
	}

	return c.JSON(users)
}
