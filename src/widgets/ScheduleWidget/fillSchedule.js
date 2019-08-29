import { find } from 'lodash';
import { days } from '../../utils';

const fillSchedule = (value, timesAttribute, dateAttribute) => {
  const schedule = [];
  days.forEach((day) => {
    let entry = find(value, { [dateAttribute]: day });
    if (!entry) {
      entry = { [dateAttribute]: false, [timesAttribute]: '' };
    } else {
      entry = {
        [dateAttribute]: !!entry[dateAttribute],
        [timesAttribute]: entry[timesAttribute],
      };
    }
    schedule.push(entry);
  });
  return schedule;
};

export default fillSchedule;
