/**
 * 雪花算法 ID 生成器
 * 
 * 结构说明（64位）:
 * - 符号位(1位): 始终为0
 * - 时间戳(41位): 毫秒级时间戳，可使用约69年
 * - 机器ID(10位): 支持1024个节点
 * - 序列号(12位): 同一毫秒内可生成4096个ID
 */
class Snowflake {
  private static readonly EPOCH = 1672531200000; // 自定义起始时间戳 (2023-01-01 00:00:00)
  private static readonly MACHINE_ID_BITS = 10;
  private static readonly SEQUENCE_BITS = 12;
  
  private static readonly MAX_MACHINE_ID = (1 << Snowflake.MACHINE_ID_BITS) - 1;
  private static readonly MAX_SEQUENCE = (1 << Snowflake.SEQUENCE_BITS) - 1;
  
  private static readonly MACHINE_ID_SHIFT = Snowflake.SEQUENCE_BITS;
  private static readonly TIMESTAMP_SHIFT = Snowflake.MACHINE_ID_BITS + Snowflake.SEQUENCE_BITS;
  
  private machineId: number;
  private sequence: number = 0;
  private lastTimestamp: number = -1;

  constructor(machineId: number = 1) {
    if (machineId < 0 || machineId > Snowflake.MAX_MACHINE_ID) {
      throw new Error(`机器ID必须在 0-${Snowflake.MAX_MACHINE_ID} 之间`);
    }
    this.machineId = machineId;
  }

  /**
   * 生成下一个唯一ID
   */
  nextId(): number {
    let timestamp = this.getCurrentTimestamp();

    // 如果当前时间小于上次生成ID的时间，说明时钟回拨，抛出异常
    if (timestamp < this.lastTimestamp) {
      throw new Error(`时钟回拨，拒绝生成ID。当前时间: ${timestamp}, 上次时间: ${this.lastTimestamp}`);
    }

    // 如果是同一毫秒内生成的，则增加序列号
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & Snowflake.MAX_SEQUENCE;
      
      // 如果序列号溢出，等待下一毫秒
      if (this.sequence === 0) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      // 不同毫秒，序列号重置为0
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    // 组装ID
    const id = ((timestamp - Snowflake.EPOCH) << Snowflake.TIMESTAMP_SHIFT) |
               (this.machineId << Snowflake.MACHINE_ID_SHIFT) |
               this.sequence;

    return id;
  }

  /**
   * 获取当前时间戳
   */
  private getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * 等待下一毫秒
   */
  private waitNextMillis(lastTimestamp: number): number {
    let timestamp = this.getCurrentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.getCurrentTimestamp();
    }
    return timestamp;
  }
}

// 创建全局单例实例
const snowflake = new Snowflake(1);

/**
 * 生成雪花算法ID
 * @returns 唯一的数字ID
 */
export function generateSnowflakeId(): number {
  return snowflake.nextId();
}

/**
 * 解析雪花算法ID
 * @param id 雪花算法生成的ID
 * @returns 包含时间戳、机器ID和序列号的对象
 */
export function parseSnowflakeId(id: number): {
  timestamp: number;
  machineId: number;
  sequence: number;
  dateTime: string;
} {
  const sequence = id & ((1 << Snowflake.SEQUENCE_BITS) - 1);
  const machineId = (id >> Snowflake.MACHINE_ID_BITS) & ((1 << Snowflake.MACHINE_ID_BITS) - 1);
  const timestamp = (id >> Snowflake.TIMESTAMP_SHIFT) + Snowflake.EPOCH;
  
  const dateTime = new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return {
    timestamp,
    machineId,
    sequence,
    dateTime
  };
}
