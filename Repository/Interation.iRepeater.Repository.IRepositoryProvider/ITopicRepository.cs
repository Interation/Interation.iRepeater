using System.Collections.Generic;
using Interation.iRepeater.Repository.Entity;

namespace Interation.iRepeater.Repository.IRepositoryProvider
{
    public interface ITopicRepository
    {
        List<Topic> GetCurrentTopics();
    }
}
