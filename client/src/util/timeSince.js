export default function timeSince(timestamp) {
    let date = new Date(timestamp * 1000);
    console.log(date);
    let seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    let count = Math.floor(interval);

    if (interval >= 1) {
      return count + " year" + ((count > 1) ? "s" : "");
    }

    interval = seconds / 2592000;
    count = Math.floor(interval);

    if (interval > 1) {
        return count + " month" + ((count > 1) ? "s" : "");
    }

    interval = seconds / 86400;
    count = Math.floor(interval);

    if (interval > 1) {
      return count + " day" + ((count > 1) ? "s" : "");
    }

    interval = seconds / 3600;
    count = Math.floor(interval);

    if (interval > 1) {
        return count + " hour" + ((count > 1) ? "s" : "");
    }

    interval = seconds / 60;
    count = Math.floor(interval);

    if (interval > 1) {
      return count + " minute" + ((count > 1) ? "s" : "");
    }
    
    return count + " second" + ((count > 1) ? "s" : "");
}