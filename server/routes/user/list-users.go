package user

import (
	"context"
	"log"
	"tasklab/database"

	"github.com/gofiber/fiber/v2"
)

func ListUsers(c *fiber.Ctx) error {
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

	rows, err := db.Query(context.Background(), "SELECT id, first_name, last_name, email FROM users")
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
