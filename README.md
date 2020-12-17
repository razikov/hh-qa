# Домашка по тестам

## Установка

```Bash
npm install
```

## Настройка

Настроить Api токен
```Bash
cp ./.env.example ./.env && nano ./.env
```

## Запуск
```Bash
npm test
```

## Через докер
```
docker build -t razikov/hh-qa .
docker run --rm razikov/hh-qa npm install
docker run --rm razikov/hh-qa ./node_modules/.bin/mocha
```