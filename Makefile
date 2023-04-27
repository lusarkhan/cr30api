build:
    docker build -t cr30-api-services .

run:
    docker run -d -p 3000:3000 --restart=always --name cr30-api-services --rm cr30-api-services