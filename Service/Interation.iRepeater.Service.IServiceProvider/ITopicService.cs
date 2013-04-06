using System.Collections.Generic;
using Interation.iRepeater.Service.Contract;

namespace Interation.iRepeater.Service.IServiceProvider
{
    public interface ITopicService
    {
        List<TopicContract> GetAdvised();
    }
}
