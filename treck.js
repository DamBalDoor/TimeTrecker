import fs from 'fs';
import moment from 'moment';
import chalk from 'chalk';
import readline from 'readline';


export default class TimeTracker {
    constructor() {
        this.startTime = null;
        this.timerInterval = null;
        this.trackerActive = false;
        this.activityDuringTrack = ''; // Переменная для хранения активности во время трека
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        this.logEntry = '';
    }

    startTracker() {
        if (this.startTime === null) {
            console.clear();
            this.startTime = moment();
            console.log(chalk.green('Трекер запущен.'));
            console.log(chalk.yellow('Нажмите "2" + "Enter", для выхода.'));
            this.activityDuringTrack = ''; // Сброс активности при запуске
            this.timerInterval = setInterval(this.displayTime.bind(this), 1000);
            this.trackerActive = true;
        } else {
            console.log(chalk.yellow('Трекер уже запущен.'));
        }
    }

    putLog() {
        console.clear();
        if (this.activityDuringTrack) {
            console.log(chalk.blue(`Активность во время трека: ` + chalk.green(this.activityDuringTrack)));
            this.logEntry += `. Активность: ` + this.activityDuringTrack;
        }
        fs.appendFileSync('time_tracker.log', this.logEntry + '\n');
        console.log(chalk.blue(`Записано в файл: ${this.logEntry}`));
    }

    stopTracker() {
        if (this.startTime !== null) {
            console.clear();
            clearInterval(this.timerInterval);

            const endTime = moment();
            const totalTime = endTime.diff(this.startTime, 'seconds');

            this.logEntry = `[${this.formatDate(this.startTime)}]: ${this.formatTime(this.startTime)} - ${this.formatTime(endTime)}. Всего: ${this.formatElapsedTime(totalTime)}`;

            console.log(chalk.blue(`Время отслеживания завершено.`));

            this.trackerActive = false;
            this.startTime = null;
            this.activityDuringTrack = '';

        } else {
            console.log(chalk.yellow('Трекер не запущен.'));
        }
    }

    displayTime() {
        const currentTime = moment();
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Время отслеживания: ${chalk.green(this.formatElapsedTime(currentTime.diff(this.startTime, 'seconds')))}`);
    }

    formatDate(date) {
        return date.format('YYYY-MM-DD');
    }

    formatTime(time) {
        return time.format('HH:mm:ss');
    }

    formatElapsedTime(seconds) {
        const duration = moment.duration(seconds, 'seconds');
        return `${duration.hours().toString().padStart(2, '0')}:${duration.minutes().toString().padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`;
    }

    printMenu() {
        console.log(chalk.blue("\n\tTimeTrecker\t\n"))
        if (this.trackerActive) {
            console.log(chalk.cyan('2. ') + chalk.green('Остановить трекер'));
        } else {
            console.log(chalk.cyan('1. ') + chalk.green('Запустить трекер'));
            console.log(chalk.cyan('2. ') + chalk.green('Выйти'));
        }
    }

    init() {
        console.clear();
        this.printMenu();

        this.rl.on('line', (input) => {
            const choice = input.trim();

            if (this.trackerActive) {

                if (choice === '2') {
                    this.stopTracker();

                    this.rl.question('Что вы делали в это время?: ', (activity) => {
                        this.activityDuringTrack = activity;
                        this.putLog();
                        this.rl.close();
                    });

                } else {
                    console.log(chalk.red('Некорректный выбор. Введите 2, чтобы остановить трекер.'));
                }

            } else {
                if (choice === '1') {
                    this.startTracker();
                } else if (choice === '2') {
                    this.rl.close();
                    process.exit();
                } else {
                    console.log(chalk.red('Некорректный выбор. Введите 1 или 2.'));

                }
            }
        });

        process.stdin.setEncoding('utf8');
    }
}

