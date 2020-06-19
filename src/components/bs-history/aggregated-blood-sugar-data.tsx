import {DateEntry} from './date-entry'
import {BloodSugar} from '../../redux/blood-sugar/blood-sugar.models'

export class AggregatedBloodSugarData {
  private dateEntry: DateEntry

  private minReading: BloodSugar | null = null
  private maxReading: BloodSugar | null = null

  private readings: BloodSugar[] = []

  public constructor(dateEntry: DateEntry) {
    this.dateEntry = dateEntry
  }

  public getDateEntry(): DateEntry {
    return this.dateEntry
  }

  private updateMinReading(reading: BloodSugar): void {
    if (!this.minReading) {
      this.minReading = reading
    }

    const readingValue = Number(reading.blood_sugar_value)
    const currentMinValue = Number(this.minReading.blood_sugar_value)

    if (currentMinValue > readingValue) {
      this.minReading = reading
    }
  }

  private updateMaxReading(reading: BloodSugar): void {
    if (!this.maxReading) {
      this.maxReading = reading
      return
    }

    const readingValue = Number(reading.blood_sugar_value)
    const currentMaxValue = Number(this.maxReading.blood_sugar_value)

    if (readingValue > currentMaxValue) {
      this.maxReading = reading
    }
  }

  public addReading(reading: BloodSugar): void {
    this.readings.push(reading)
    this.updateMinReading(reading)
    this.updateMaxReading(reading)
  }

  public getReadings(): BloodSugar[] {
    return this.readings
  }

  public getMaxReading(): BloodSugar | null {
    return this.maxReading
  }

  public getMinReading(): BloodSugar | null {
    return this.minReading
  }
}
