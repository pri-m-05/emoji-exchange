
    FROM golang:1.23 AS build

   
    WORKDIR /app
    
    
    COPY go.mod go.sum ./
    RUN go mod download
    
  
    COPY . .
    
  
    RUN CGO_ENABLED=0 go build -o /bin/api ./cmd/api
    
  
    FROM gcr.io/distroless/base-debian12
    
  
    COPY --from=build /bin/api /api
    
  
    ENV HTTP_PORT=8080
    
  
    EXPOSE 8080
    
   
    CMD ["/api"]
    