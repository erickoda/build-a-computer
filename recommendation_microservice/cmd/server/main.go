package main

import (
	"go.uber.org/fx"

	"github.com/erickoda/build-a-computer/recommendation_microservice/internal/app"
)

func main() {
	fx.New(
		app.Module,
	).Run()
}

