package auth

import (
	"context"
	"log"
	"strings"
	"tasklab/database"
	"tasklab/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

func CreateAccount(c *fiber.Ctx) error {
	// getting body values
	v := new(struct {
		FirstName string `json:"firstName" validate:"required,min=1"`
		LastName  string `json:"lastName" validate:"required,min=1"`
		Email     string `json:"email" validate:"required,email"`
		Password  string `json:"password" validate:"required,min=8"`
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

	// checking if account already exists
	var rows int
	err = db.QueryRow(ctx, "SELECT COUNT(*) FROM users WHERE email = $1", strings.ToLower(v.Email)).Scan(&rows)
	if err != nil {
		if err != pgx.ErrNoRows {
			return err
		}
	}

	if rows > 0 {
		fiber.ErrBadRequest.Message = "Account already exists"
		return fiber.ErrBadRequest
	}

	// encrypt password
	hashedPasswordByte, err := bcrypt.GenerateFromPassword([]byte(v.Password), 10)
	if err != nil {
		return err
	}

	var id, role string
	err = db.QueryRow(ctx, "INSERT INTO users(first_name, last_name, email, password) VALUES($1, $2, $3, $4) RETURNING id, role", v.FirstName, v.LastName, strings.ToLower(v.Email), string(hashedPasswordByte)).Scan(&id, &role)
	if err != nil {
		return err
	}

	type Response struct {
		Id    string `json:"id"`
		Email string `json:"email"`
		Role  string `json:"role"`
	}

	return c.JSON(Response{
		Id:    id,
		Email: strings.ToLower(v.Email),
		Role:  role,
	})
}
